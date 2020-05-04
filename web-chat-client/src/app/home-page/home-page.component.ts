import {Component, OnInit, AfterViewChecked, ElementRef, ViewChild, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import { ChatService } from '../shared/services/chat.service';
import {Message} from '../shared/interfaces';
import {Room} from '../shared/interfaces';
import {AuthService} from '../shared/services/auth.service';
import {Router} from '@angular/router';

import 'quill-mention';
import 'quill-emoji';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit, AfterViewChecked, OnDestroy {

  // For input message
  quillModules = {};
  formMessage: FormGroup;

  // User data
  user = '';
  roomId = '';
  roomIdx = -1;
  roomName = '';
  roomList: Room[] = [];
  contactBook = {};

  // For add new contact and create group chat
  modalContact = false;
  modalGroup = false;

  // Subscriptions for observables
  private subGetMsg: Subscription;
  private subLoadData: Subscription;
  private subContacs: Subscription;
  private subGroups: Subscription;

  @ViewChild('scrollMessages')
  private scrMessages: ElementRef;

  @ViewChild('scrollContacts')
  private scrContacts: ElementRef;

  constructor(public chatService: ChatService, public auth: AuthService, private router: Router) {
    // Setup text editor from
    this.quillModules = {
      toolbar: {
        container: [
          ['bold', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['image', 'video'],
          ['emoji'],
        ],
        handlers: {
          'emoji': function() {
          }},
      },
      'emoji-toolbar': true,
      'emoji-textarea': false,
      'emoji-shortname': true,
    };

  }

  // Need for scroll-down
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnInit(): void {
    // Initialize form for send messages
    this.formMessage = new FormGroup({
      message: new FormControl(null, [Validators.required])
    });

    // Connect to server
    this.user = sessionStorage.getItem('email');
    this.chatService.createSocket(this.user);

    // Listen server on new messages
    this.subGetMsg = this.chatService.getMessages()
      .subscribe((message: Message) => {
        const idx = this.getRoomIdxByRoomId(message.toRoom);
        this.roomList[idx].messageList.push(message);
        if (this.roomIdx !== idx) {
          this.roomList[idx].unread++;
        } else {
          this.scrollToBottom();
        }
      });

    // Listen server on load data about this account
    this.subLoadData = this.chatService.loadData()
      .subscribe((data: Room[]) => {
        data.forEach((curRum) => {
          if (curRum.roomId !== '0') {
            curRum.userList.forEach((name) => {
              this.contactBook[name] = '';
            });
          }
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

    // Listen server on notification if this account added to another contact book
    this.subContacs = this.chatService.contactAdded()
      .subscribe((data: Room) => {
        data.userList.forEach((name) => {
          this.contactBook[name] = '';
        });
        data.unread = 0;
        this.roomList.push(data);
        this.scrollToBottom();
      });

    this.subGroups = this.chatService.groupAdded()
      .subscribe((data: Room) => {
        data.unread = 0;
        this.roomList.push(data);
        this.scrollToBottom();
      });
  }

  // Stay scroll always on bottom
  scrollToBottom() {
    try {
      this.scrMessages.nativeElement.scrollTop = this.scrMessages.nativeElement.scrollHeight;
    } catch(err) { }
    try {
      this.scrContacts.nativeElement.scrollTop = this.scrContacts.nativeElement.scrollHeight;
    } catch(err) { }
  }

  // Send message to server
  sendMessage() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.formMessage.invalid) {
      return;
    }
    let msg = this.formMessage.value.message;
    if (!msg.trim()) {
      this.formMessage.reset();
      return;
    }

    // Load data from input form
    const message: Message = {
      fromUser: this.user,
      toRoom: this.roomId,
      message: msg
    };

    // TODO: Fix open 2+ session with same account without bugs
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

  // Change between chats
  changeRoom(curRoom, toRoom) {
    if (curRoom === toRoom) {
      return;
    }
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

  // Get chat name. Need for case when room is contact
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

  // Unsubsribe from observables for prevent memory leak
  ngOnDestroy() {
    this.subLoadData.unsubscribe();
    this.subGroups.unsubscribe();
    this.subContacs.unsubscribe();
    this.subGetMsg.unsubscribe();
  }

}
