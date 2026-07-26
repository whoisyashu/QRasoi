import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://qrasoi.onrender.com/api';
// Extract root server origin for Socket.IO connection
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

class SocketClient {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Real-time Socket.IO connected:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('⚠️ Real-time Socket.IO disconnected:', reason);
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  public joinRestaurant(restaurantId: string): void {
    const s = this.connect();
    if (restaurantId) {
      s.emit('join:restaurant', restaurantId);
    }
  }

  public joinOrder(orderId: string): void {
    const s = this.connect();
    if (orderId) {
      s.emit('join:order', orderId);
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketClient = new SocketClient();
