import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HomePageComponent} from '../home-page/home-page.component';
import {Room} from '../shared/interfaces';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss']
})
export class AddGroupComponent implements OnInit {

  formAddGroup: FormGroup;
  submitted = false;
  dropdownList = [];
  dropdownSettings: IDropdownSettings = {};

  constructor(public account: HomePageComponent) { }

  @Output()
  groupAdded = new EventEmitter<void>();

  ngOnInit(): void {
    // Initialize from for add group
    this.formAddGroup = new FormGroup({
      groupName: new FormControl(null, [
        Validators.required
      ]),
      groupMembers: new FormControl(null, [
        Validators.required
      ])
    });

    let uid = 1;
    Object.keys(this.account.contactBook).forEach((userName) => {
      this.dropdownList.push({
        uid,
        userName
      });
      uid++;
    });

    this.dropdownSettings = {
      idField: 'uid',
      textField: 'userName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      maxHeight: 200
    };
  }

  // Create group only from user contact book
  submit() {
    if (this.formAddGroup.invalid) {
      return;
    }

    // Load data from input form
    this.submitted = true;
    let userList = [];
    this.formAddGroup.value.groupMembers.forEach((member) => {
      userList.push(member.userName);
    });
    if (userList.indexOf(this.account.user) === -1) {
      userList.push(this.account.user);
    }

    const data: Room = {
      userList,
      name: this.formAddGroup.value.groupName,
      messageList: [],
      isGroup: true,
    };

    // Emit signal for create group
    this.account.chatService.addGroup(data);
    this.formAddGroup.reset();
    this.groupAdded.emit();
  }
}
