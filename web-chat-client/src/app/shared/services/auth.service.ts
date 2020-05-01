import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {tap, catchError} from 'rxjs/operators';
import {Observable, throwError, Subject} from 'rxjs';

import {FbAuthResponse, User} from '../../shared/interfaces';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public error$: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {
  }

  get token(): string {
    return sessionStorage.getItem('fb-token');
  }

  login(curUser: User): Observable<any> {
    curUser.returnSecureToken = true;
    return this.http.post(
      `${environment.signInfbUrl}?key=${environment.apiKey}`,
      curUser
    ).pipe(
      tap(this.setToken),
      catchError(this.handleError.bind(this))
    );
  }

  register(curUser: User): Observable<any> {
    curUser.returnSecureToken = true;
    return this.http.post(
      `${environment.signUpfbUrl}?key=${environment.apiKey}`,
      curUser
    ).pipe(
      tap(this.setToken),
      catchError(this.handleError.bind(this))
    );
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error;
    switch (message) {
      case 'INVALID_EMAIL':
        this.error$.next('Invalid email.');
        break;
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Email not found.')
        break;
      case 'EMAIL_EXISTS':
        this.error$.next('Email already exist.');
        break;
      case 'INVALID_PASSWORD':
        this.error$.next('Invalid password.');
        break;
    }
    return throwError(error);
  }

  private setToken(response: FbAuthResponse | null) {
    if (response) {
      console.log(response);
      sessionStorage.setItem('fb-token', response.idToken);
      sessionStorage.setItem('email', response.email);
    } else {
      sessionStorage.clear();
    }
  }
}
