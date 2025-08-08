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
import { Logger } from '@nestjs/common';

interface ManagerLocation {
  managerId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  siteId?: string;
  ownerId: string;
}

@WebSocketGateway({ cors: true })
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LocationGateway.name);

  // Map managerId => latest location
  private connectedManagers: Map<string, ManagerLocation> = new Map();

  // Map socket.id => managerId (for disconnect tracking)
  private socketManagerMap: Map<string, string> = new Map();

  // Map ownerId => Set of managerIds
  private ownerManagersMap: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`[SOCKET] Client connected: ${client.id}`);
    console.log(`[SOCKET] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[SOCKET] Client disconnecting: ${client.id}`);
    console.log(`[SOCKET] Client disconnecting: ${client.id}`);
    
    const managerId = this.socketManagerMap.get(client.id);
    if (managerId) {
      this.logger.log(`[SOCKET] Found managerId for disconnecting client: ${managerId}`);
      
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
      this.logger.log(`[SOCKET] Client disconnected: ${client.id} (No managerId tracked)`);
      console.log(`[SOCKET] Client disconnected: ${client.id} (No managerId tracked)`);
    }
  }

  @SubscribeMessage('managerLocation')
  handleManagerLocation(
    @MessageBody() data: ManagerLocation,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`[SOCKET] Received managerLocation event from client: ${client.id}`);
    console.log(`[SOCKET] Received managerLocation event from client: ${client.id}`);
    console.log(`[SOCKET] Data received:`, JSON.stringify(data, null, 2));

    if (data.managerId && data.ownerId) {
      this.logger.log(`[SOCKET] Manager location received for managerId: ${data.managerId}`);
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
      this.logger.error(`[SOCKET] Bad location: No managerId or ownerId`, data);
      console.log(`[SOCKET] Bad location: No managerId or ownerId`, data);
    }

    // Broadcast location update to all clients
    this.logger.log(`[SOCKET] Broadcasting location update to all clients`);
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
    this.logger.log(`[SOCKET] Broadcasting managers: count=${managers.length}`);
    console.log(`[SOCKET] Broadcasting managers: count=${managers.length}`);
    console.log(`[SOCKET] Managers data:`, managers);
    this.server.emit('connectedManagers', managers);
  }

  @SubscribeMessage('getMyManagersLocations')
  handleGetMyManagersLocations(
    @MessageBody() ownerId: string,
    @ConnectedSocket() client: Socket
  ) {
    this.logger.log(`[SOCKET] Received getMyManagersLocations for ownerId: ${ownerId}`);
    console.log(`[SOCKET] Received getMyManagersLocations for ownerId: ${ownerId}`);
    
    const managerIds = this.ownerManagersMap.get(ownerId);
    let result: ManagerLocation[] = [];
    if (managerIds) {
      result = Array.from(managerIds)
        .map((managerId) => this.connectedManagers.get(managerId))
        .filter((ml): ml is ManagerLocation => !!ml);
    }
    
    this.logger.log(`[SOCKET] Sending ${result.length} managers to client`);
    console.log(`[SOCKET] Sending managers:`, result);
    client.emit('myManagersLocations', result);
  }

  getAllConnectedManagers(): ManagerLocation[] {
    return Array.from(this.connectedManagers.values());
  }
}