import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, Credential: true })
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('hello')
  handleHello(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Frontend says:', data);
    client.emit('server-response', `👋 Hello from backend! You said : ${data}`);
  }

  @SubscribeMessage('place-order')
  sendNewOrder(data: any) {
    console.log('📥 Received order:', data);
    this.server.emit('newOrder', data);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    console.log(`client ${client.id} joined room ${roomId}`);
  }

  sendOrderUpdate(roomId: string, order: any) {
    this.server.to(roomId).emit('orderUpdate', order);
  }
}
