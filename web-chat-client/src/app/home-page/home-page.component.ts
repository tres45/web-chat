import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import { ChatService } from '../shared/services/chat.service';
import {Message} from '../shared/interfaces';
import {Room} from '../shared/interfaces';
import {AuthService} from '../shared/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, AfterViewChecked {

  formMessage: FormGroup;
  user = '';
  roomId = '';
  roomIdx = -1;
  roomName = '';
  roomList: Room[] = [];

  modalContact = false;
  modalGroup = false;

  @ViewChild('scrollMessages')
  private scrMessages: ElementRef;

  @ViewChild('scrollContacts')
  private scrContacts: ElementRef;

  constructor(public chatService: ChatService, public auth: AuthService, private router: Router) {
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnInit(): void {
    this.formMessage = new FormGroup({
      message: new FormControl(null,[Validators.required])
    });

    this.user = sessionStorage.getItem('email');
    this.chatService.createSocket(this.user);

    this.chatService.getMessages()
      .subscribe((message: Message) => {
        console.log('new-massage:', message);
        let idx = this.getRoomIdxByRoomId(message.toRoom);
        this.roomList[idx].messageList.push(message);
        if (this.roomIdx !== idx) {
          this.roomList[idx].unread++;
        }
        this.scrollToBottom();
      });

    this.chatService.loadData()
      .subscribe((data: Room[]) => {
        data.forEach((curRum) => {
          curRum.unread = 0;
          curRum.messageList.forEach((message) => {
            if (message.isUnread) {
              curRum.unread++;
            }
          });
          this.roomList.push(curRum);
        });
        this.scrollToBottom();
      });

    this.chatService.contactAdded()
      .subscribe((data: Room) => {
        console.log('contact added', data);
        data.unread = 0;
        this.roomList.push(data);
        this.scrollToBottom();
      });
  }

  scrollToBottom() {
    try {
      this.scrMessages.nativeElement.scrollTop = this.scrMessages.nativeElement.scrollHeight;
    } catch(err) { }
    try {
      this.scrContacts.nativeElement.scrollTop = this.scrContacts.nativeElement.scrollHeight;
    } catch(err) { }
  }

  sendMessage() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.formMessage.invalid) {
      console.log('invalid');
      return;
    }
    let msg = this.formMessage.value.message;
    if (!msg.trim()) {
      this.formMessage.reset();
      return;
    }

    const message: Message = {
      fromUser: this.user,
      toRoom: this.roomId,
      message: msg
    };
    this.roomList[this.roomIdx].messageList.push(message);
    this.chatService.sendMessage(message);
    this.formMessage.reset();
    this.scrollToBottom();
    return;
  }

  getRoomIdxByRoomId(roomId: string): number {
    let idx = -1;
    for (let i = 0; i < this.roomList.length; i++) {
      if (this.roomList[i].roomId === roomId) {
        idx = i;
        break;
      }
    }
    return idx;
  }

  changeRoom(curRoom, toRoom) {
    if (curRoom === toRoom) {
      return;
    }// TODO
    const idx = this.getRoomIdxByRoomId(toRoom);
    this.roomIdx = idx;
    this.roomName = this.roomList[idx].name;

    const data = {
      user: this.user,
      curRoom,
      toRoom
    };
    this.roomId = toRoom;
    this.chatService.changeRoom(data);
    this.scrollToBottom();
    this.roomList[idx].unread = 0;
  }

  changeRoomIndex(curIdx, toIdx) {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    let curRoom = '';
    try {
      curRoom = this.roomList[curIdx].roomId;
    } catch (err) { }
    const toRoom = this.roomList[toIdx].roomId;

    this.changeRoom(curRoom, toRoom);
  }

  getRoomNameById(id: string): string {
    if (id === '') {
      return '';
    }
    const idx = this.getRoomIdxByRoomId(id);
    if (idx < 0) {
      return '';
    }

    const users = this.roomList[idx].userList;
    if (this.roomList[idx].isGroup) {
      return this.roomList[idx].name;
    } else if (users.length === 2) {
      if (users[0] === this.user) {
        return users[1];
      } else {
        return users[0];
      }
    }
    return this.user;
  }

}
