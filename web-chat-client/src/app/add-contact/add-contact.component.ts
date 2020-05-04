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
    // Initialize from for add contact
    this.formAddContact = new FormGroup({
      email: new FormControl(null, [
        Validators.required, Validators.email
      ])
    });

    // subscribe on socket io for check if contact registered
    this.account.chatService.contactNotFound()
      .subscribe((res) => {
        this.isContactNotFound = res;
      });
  }

  notFoundError(): any {
    this.formAddContact.controls.email.setErrors({
      emailNotFound: true
    });
  }

  emailExistError() {
    this.formAddContact.controls.email.setErrors({
      emailExist: true
    });
  }

  // Find and add contact
  submit() {
    this.isExist = false;
    if (this.formAddContact.invalid) {
      return;
    }
    if (this.formAddContact.value.email in this.account.contactBook) {
      this.isExist = false;
      this.emailExistError();
      return;
    }

    // Load data from input form
    this.submitted = true;
    const data: Room = {
      name: this.account.user + '↵' + this.formAddContact.value.email,
      userList: [this.account.user, this.formAddContact.value.email],
      messageList: [],
      isGroup: false,
    };

    // Emit signal for add new contact
    this.account.chatService.addContact(data);
    // Need timeout for socket
    setTimeout(() => {
      // If user not found - return error to form validator
      if (this.isContactNotFound) {
        this.notFoundError();
        if (this.formAddContact.invalid) {
          this.isContactNotFound = false;
          this.submitted = false;
          return;
        }
      }

      // Reset form and emit close modal window
      this.isContactNotFound = false;
      this.submitted = false;
      this.formAddContact.reset();
      this.contactAdded.emit();
    }, 500);
  }

}
