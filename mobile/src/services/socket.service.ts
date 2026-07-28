import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://qrasoi.onrender.com';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ [Socket.IO] Connected to QRasoi Server:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ [Socket.IO] Disconnected:', reason);
      });
    }
    return this.socket;
  }

  joinRestaurantRoom(restaurantId: string): void {
    this.socket?.emit('join_restaurant_room', { restaurantId });
  }

  joinOrderRoom(orderId: string): void {
    this.socket?.emit('join_order_room', { orderId });
  }

  onOrderCreated(callback: (order: any) => void): void {
    this.socket?.on('order:created', callback);
  }

  onOrderStatusUpdated(callback: (data: { orderId: string; status: string }) => void): void {
    this.socket?.on('order:status_updated', callback);
  }

  onOrderItemStatusUpdated(callback: (data: { itemId: string; orderId: string; status: string }) => void): void {
    this.socket?.on('order_item:status_updated', callback);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
