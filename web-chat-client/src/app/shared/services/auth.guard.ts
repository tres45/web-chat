import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Params } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private chatService: ChatService, private auth: AuthService, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']);
    }
  }
}