import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';

export class ChatService {
  private url = 'http://localhost:3000';
  private socket;    

  constructor() {
    this.socket = io(this.url);
  }

  public sendMessage(message) {
    console.log(message);
    this.socket.emit('new-message', message);
  }
}