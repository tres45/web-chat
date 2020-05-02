import * as io from 'socket.io-client';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';

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

  public getMessages(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('new-message', (message) => {
        observer.next(message);
      });
    });
  }

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

  public contactAdded(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('contact-added', (data) => {
        observer.next(data);
      });
    });
  }

  public contactNotFound(): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on('contact-not-found', (res) => {
        observer.next(res);
      });
    });
  }

}
