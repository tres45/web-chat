import { Component } from '@angular/core';

import { ChatService } from './shared/services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  message: string;

  constructor(private chatService: ChatService) {
  }

}
