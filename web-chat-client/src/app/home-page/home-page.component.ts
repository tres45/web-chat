import { Component, OnInit } from '@angular/core';

import { ChatService } from '../shared/services/chat.service';
import {Message} from '../shared/interfaces';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  message: string;
  messageList: string[] = [];
  user: string;
  room: string;

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.user = sessionStorage.getItem('email');
    this.room = this.user;
    this.chatService.createSocket(this.user);

    this.chatService.getMessages()
      .subscribe((message: Message) => {
        console.log('new-massage:', message);
        this.messageList.push(message.message);
      });

    this.chatService.loadData()
      .subscribe((data: any) => {
        data[1].messageList.forEach((message) => {
          this.messageList.push(message.message);
        });
        // TODO: by rooms
      });
  }

  sendMessage() {
    if (!this.message || !this.message.trim()) {
      this.message = '';
      return;
    }

    this.changeRoom(this.room, this.user);
    const message: Message = {
      fromUser: this.user,
      message: this.message,
      toRoom: this.user
    }
    this.chatService.sendMessage(message);
    this.messageList.push(this.message);
    this.message = '';
  }

  sendMessageToAll() { // TODO: del func
    if (!this.message || !this.message.trim()) {
      this.message = '';
      return;
    }

    this.changeRoom(this.room, '0');
    const message: Message = {
      fromUser: this.user,
      message: this.message,
      toRoom: '0'
    }
    this.chatService.sendMessage(message);
    this.messageList.push(this.message);
    this.message = '';
  }

  changeRoom(curRoom, toRoom) {
    if (curRoom != toRoom) { // TODO
      let data = {
        user: this.user,
        curRoom,
        toRoom
      };
      this.room = toRoom;
      this.chatService.changeRoom(data);
    }
  }

}
