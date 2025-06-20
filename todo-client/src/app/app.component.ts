import { Component, } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoListComponent } from './todo/components/todo-list/todo-list.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,TodoListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'todo-client';
}
