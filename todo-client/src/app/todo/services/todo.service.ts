import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';
import { AuthService } from './auth.service';

// export interface Todo {
//   id: number;
//   task: string;
//   completed: boolean;
// }


@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:3000/todos';

  constructor(private http: HttpClient, private authService: AuthService) { }


getAuthHeaders(){
const token= this.authService.getToken();
return{
  headers: {
    Authorization: `Bearer ${token}`
  }
};
}




  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl,this.getAuthHeaders());
  }

  addTodo(task: string): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, {task},this.getAuthHeaders());
  }
  completeTodo(id: number): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, { completed: true },this.getAuthHeaders());
  }
  deleteTodo(id: number): Observable<Todo> {
    return this.http.delete<Todo>(`${this.apiUrl}/${id}`,this.getAuthHeaders());
  }
classifyTask(task: string): Observable<{category: string}>{
  return this.http.post<{category:string}>(
    'http://localhost:3000/api/classify-task', {task});}
  
}


