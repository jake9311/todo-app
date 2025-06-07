import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    // private authUrl= 'http://localhost:3000';
    private authUrl= '/todos';
    constructor(private http: HttpClient) {}

    login(username: string, password: string): Observable<{token: string}> {
        return this.http.post<{token: string}>(`${this.authUrl}/login`, { username, password });
      }

      saveToken(token: string): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('token', token);
        }
      }

      getToken(): string | null {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('token');
        }
        return null;
      }

      logout(): void {
        if (typeof window !== 'undefined' && window.localStorage){
        localStorage.removeItem('token');
      }
    }

      isLoggedIn(): boolean {
        return !!this.getToken();
      }

      getUsername(): string |null{
        const token= this.getToken();
        if (!token)return null;
        try{
          const payload= JSON.parse(atob(token.split('.')[1]));
          return payload.username;
        }catch(e){
          return null;
        }

       
      }


}