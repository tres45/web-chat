import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

import {Room} from '../shared/interfaces';
import { HomePageComponent } from '../home-page/home-page.component';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactComponent implements OnInit {

  @Output()
  contactAdded = new EventEmitter<void>();

  formAddContact: FormGroup;
  submitted = false;
  isContactNotFound = false;
  isExist = false;

  constructor(public account: HomePageComponent) { }

  ngOnInit(): void {
    this.formAddContact = new FormGroup({
      email: new FormControl(null, [
        Validators.required, Validators.email
      ])
    });

    this.account.chatService.contactNotFound()
      .subscribe((res) => {
        this.isContactNotFound = res;
      });
  }

  notFoundError(): any {
    this.formAddContact.controls['email'].setErrors({ 'emailNotFound': true });
  }

  emeilExistError(): any {
    this.formAddContact.controls['email'].setErrors({ 'emeilExist': true });
  }

  submit() {
    if (this.formAddContact.invalid) {
      return;
    }

    this.isExist = false;
    for (let i = 1; i < this.account.roomList.length; i++) {
      this.account.roomList[i].userList.forEach((name) => {
        if (name === this.formAddContact.value.email) {
          this.isExist = true;
          this.emeilExistError();
          return;
        }
      });
      if (this.isExist) {
        return;
      }
    }

    this.submitted = true;
    const data: Room = { // TODO
      name: this.account.user + '↵' + this.formAddContact.value.email,
      userList: [this.account.user, this.formAddContact.value.email],
      messageList: [],
      isGroup: false,
    };

    this.account.chatService.addContact(data);
    setTimeout(() => {
      if (this.isContactNotFound) {
        this.notFoundError();
        if (this.formAddContact.invalid) {
          this.isContactNotFound = false;
          this.submitted = false;
          return;
        }
      }
      this.isContactNotFound = false;
      this.submitted = false;
      this.formAddContact.reset();
      this.contactAdded.emit();
    }, 500);
  }

}
