import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', { withCredentials: true });
      this.socket.on('connect', () => console.log('🔌 connected:', this.socket.id));
    }
  }

  emit(event: string, data?: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket.on(event, callback);
  }
}
