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
}

@WebSocketGateway({ cors: true })
export class LocationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map managerId => latest location
  private connectedManagers: Map<string, ManagerLocation> = new Map();

  // Map socket.id => managerId (for disconnect tracking)
  private socketManagerMap: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`[SOCKET] Client connected: ${client.id}`);
  }

  // Handle socket disconnect
  handleDisconnect(client: Socket) {
    const managerId = this.socketManagerMap.get(client.id);
    if (managerId) {
      console.log(`[SOCKET] Manager disconnected: ${managerId} (Socket: ${client.id})`);
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
    // Track this manager as connected
    if (data.managerId) {
      console.log(`[SOCKET] Manager location received:`, data);
      this.connectedManagers.set(data.managerId, data);
      this.socketManagerMap.set(client.id, data.managerId);
      this.broadcastConnectedManagers();
    } else {
      console.log(`[SOCKET] Bad location: No managerId`, data);
    }

    // Broadcast location update to all clients
    this.server.emit('managerLocationUpdate', {
      managerId: data.managerId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp,
      siteId: data.siteId,
    });
  }

  // Broadcast all connected managers and their locations
  broadcastConnectedManagers() {
    const managers = Array.from(this.connectedManagers.values());
    console.log(`[SOCKET] Broadcasting managers: count=${managers.length}`);
    this.server.emit('connectedManagers', managers);
  }

  // Optionally: add a method to get all connected managers for REST or other internal use
  getAllConnectedManagers(): ManagerLocation[] {
    return Array.from(this.connectedManagers.values());
  }
}