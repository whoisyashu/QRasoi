import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

class SocketService {
  private io: SocketIOServer | null = null;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    this.io.on('connection', (socket: Socket) => {

      // Join tenant/restaurant room (Owner, Chef, Cashier)
      socket.on('join:restaurant', (restaurantId: string) => {
        if (restaurantId) {
          const room = `restaurant:${restaurantId}`;
          socket.join(room);
        }
      });

      // Join specific order room (Customer Order Status Tracking)
      socket.on('join:order', (orderId: string) => {
        if (orderId) {
          const formattedId = orderId.startsWith('QR-') ? orderId : `QR-${orderId}`;
          socket.join(`order:${formattedId}`);
          socket.join(`order:${orderId}`);
        }
      });

      socket.on('disconnect', () => {
      });
    });

    console.log('⚡ Socket.IO Real-Time Engine Initialized.');
    return this.io;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Emit event when a new customer places an order
   */
  public emitOrderCreated(restaurantId: string, order: any): void {
    if (!this.io) return;
    const restRoom = `restaurant:${restaurantId}`;
    this.io.to(restRoom).emit('order:created', order);
  }

  /**
   * Emit event when cashier/owner verifies order payment
   */
  public emitPaymentVerified(restaurantId: string, orderId: string, orderData: any): void {
    if (!this.io) return;
    const formattedId = orderId.startsWith('QR-') ? orderId : `QR-${orderId}`;
    this.io.to(`restaurant:${restaurantId}`).emit('order:payment_verified', orderData);
    this.io.to(`order:${orderId}`).emit('order:payment_verified', orderData);
    this.io.to(`order:${formattedId}`).emit('order:payment_verified', orderData);
  }

  /**
   * Emit event when kitchen updates status of an individual item or complete order
   */
  public emitOrderItemStatusUpdated(restaurantId: string, orderId: string, payload: any): void {
    if (!this.io) return;
    const formattedId = orderId.startsWith('QR-') ? orderId : `QR-${orderId}`;
    this.io.to(`restaurant:${restaurantId}`).emit('order_item:status_updated', payload);
    this.io.to(`order:${orderId}`).emit('order_item:status_updated', payload);
    this.io.to(`order:${formattedId}`).emit('order_item:status_updated', payload);
  }

  /**
   * Emit event when overall order status changes (e.g. ready or completed)
   */
  public emitOrderStatusUpdated(restaurantId: string, orderId: string, status: string, orderData?: any): void {
    if (!this.io) return;
    const formattedId = orderId.startsWith('QR-') ? orderId : `QR-${orderId}`;
    const payload = { orderId, status, ...(orderData || {}) };
    this.io.to(`restaurant:${restaurantId}`).emit('order:status_updated', payload);
    this.io.to(`order:${orderId}`).emit('order:status_updated', payload);
    this.io.to(`order:${formattedId}`).emit('order:status_updated', payload);
  }
}

export const socketService = new SocketService();
