export interface User {
  email: string;
  password: string;
  returnSecureToken?: boolean;
}

export interface FbAuthResponse {
  idToken: string;
  email: string;
}

export interface FbCreateResponse {
  name: string;
}

export interface Message {
  fromUser: string;
  toRoom: string;
  message: string;
  id?: number;
  isUnread?: boolean;
}