export interface User {
  email: string;
  password: string;
  returnSecureToken?: boolean;
}

export interface FbAuthResponse {
  idToken: string;
  email: string;
}

export interface Message {
  fromUser: string;
  toRoom: string;
  message: string;
  id?: number;
  isUnread?: boolean;
}

export interface Room {
  name: string;
  userList: string[];
  messageList: Message[];
  isGroup: boolean;
  roomId?: string;
  unread?: number;
}
