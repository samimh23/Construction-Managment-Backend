import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ManagerLocation {
  managerId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  siteId?: string;
  ownerId: string; // <-- Added ownerId for filtering
}

@WebSocketGateway({ cors: true })
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map managerId => latest location
  private connectedManagers: Map<string, ManagerLocation> = new Map();

  // Map socket.id => managerId (for disconnect tracking)
  private socketManagerMap: Map<string, string> = new Map();

  // Map ownerId => Set of managerIds
  private ownerManagersMap: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`[SOCKET] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const managerId = this.socketManagerMap.get(client.id);
    if (managerId) {
      const location = this.connectedManagers.get(managerId);
      if (location && location.ownerId) {
        // Remove from ownerManagersMap
        const ownerSet = this.ownerManagersMap.get(location.ownerId);
        if (ownerSet) {
          ownerSet.delete(managerId);
          if (ownerSet.size === 0) {
            this.ownerManagersMap.delete(location.ownerId);
          }
        }
      }
      this.connectedManagers.delete(managerId);
      this.socketManagerMap.delete(client.id);
      this.broadcastConnectedManagers();
    } else {
      console.log(`[SOCKET] Client disconnected: ${client.id} (No managerId tracked)`);
    }
  }

  @SubscribeMessage('managerLocation')
  handleManagerLocation(
    @MessageBody() data: ManagerLocation,
    @ConnectedSocket() client: Socket,
  ) {
    if (data.managerId && data.ownerId) {
      console.log(`[SOCKET] Manager location received:`, data);
      this.connectedManagers.set(data.managerId, data);
      this.socketManagerMap.set(client.id, data.managerId);

      // Maintain ownerManagersMap
      let ownerSet = this.ownerManagersMap.get(data.ownerId);
      if (!ownerSet) {
        ownerSet = new Set<string>();
        this.ownerManagersMap.set(data.ownerId, ownerSet);
      }
      ownerSet.add(data.managerId);

      this.broadcastConnectedManagers();
    } else {
      console.log(`[SOCKET] Bad location: No managerId or ownerId`, data);
    }

    // Broadcast location update to all clients
    this.server.emit('managerLocationUpdate', {
      managerId: data.managerId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp,
      siteId: data.siteId,
      ownerId: data.ownerId,
    });
  }

  // Broadcast all connected managers and their locations
  broadcastConnectedManagers() {
    const managers = Array.from(this.connectedManagers.values());
    console.log(`[SOCKET] Broadcasting managers: count=${managers.length}`);
    this.server.emit('connectedManagers', managers);
  }

  @SubscribeMessage('getMyManagersLocations')
  handleGetMyManagersLocations(
    @MessageBody() ownerId: string,
    @ConnectedSocket() client: Socket
  ) {
    const managerIds = this.ownerManagersMap.get(ownerId);
    let result: ManagerLocation[] = [];
    if (managerIds) {
      result = Array.from(managerIds)
        .map((managerId) => this.connectedManagers.get(managerId))
        .filter((ml): ml is ManagerLocation => !!ml);
    }
    client.emit('myManagersLocations', result);
  }

  getAllConnectedManagers(): ManagerLocation[] {
    return Array.from(this.connectedManagers.values());
  }
}