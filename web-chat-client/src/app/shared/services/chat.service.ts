import * as io from 'socket.io-client';
import {Injectable} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  socket;
  user: string;

  constructor(private auth: AuthService) {
  }

  // Create socket for connect with server
  public createSocket(curUser) {
    if (this.auth.isAuthenticated()) {
      this.socket = io(`${environment.socketUrl}`);
      this.user = curUser;
      this.socket.emit('new-connection', curUser);
    }
  }

  public sendMessage(message) {
    this.socket.emit('new-message', message);
  }

  // Create observable for listen server on new messages
  public getMessages(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('new-message', (message) => {
        observer.next(message);
      });
    });
  }

  // Create observable for load user data from server
  public loadData(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('load-data', (data) => {
        observer.next(data);
      });
    });
  }

  public changeRoom(room) {
    this.socket.emit('change-room', room);
  }

  public addContact(data) {
    this.socket.emit('add-contact', data);
  }

  public addGroup(data) {
    this.socket.emit('add-group', data);
  }

  // Create observable for listen server on new friend
  public contactAdded(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('contact-added', (data) => {
        observer.next(data);
      });
    });
  }

  // Create observable for listen server on new groups
  public groupAdded(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('group-added', (data) => {
        observer.next(data);
      });
    });
  }

  // Create observable for listen server on wrong contact
  public contactNotFound(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('contact-not-found', (res) => {
        observer.next(res);
      });
    });
  }

}
