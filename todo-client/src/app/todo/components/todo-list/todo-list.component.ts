import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService} from '../../services/todo.service';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { ValidationService } from '../../services/validation.service';



@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {

  todos: Todo[] = [];
  newTask: string= '';
  errorMessage: string = '';
  username='';

  constructor(private todoService: TodoService, private authService: AuthService, private router: Router, private validationService: ValidationService) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
  if (this.authService.isLoggedIn()) {
    this.loadTodos();
  }
}

  loadTodos() {
    this.todoService.getTodos().subscribe(data => {
      this.todos = data;
    });
  }

  addTask():void {
    if(!this.newTask.trim())return;
    if(this.validationService.checkInvalidChars(this.newTask)){
      this.errorMessage = 'Invalid characters in the task  (< >). Please try again.';
      return;
    }
    this.todoService.classifyTask(this.newTask).subscribe({
      next: (res) => {
        const category = res.category;
   

    this.todoService.addTodo(`${this.newTask} [${category}]`).subscribe({ 
      next: (newTodo)=>{
      this.todos.push(newTodo);
      this.newTask = '';;
      this.errorMessage = '';
  },
  error:()=>{
    this.errorMessage = 'Faild to add task.'
  }
  });
  },
  error:()=>{
    this.errorMessage = 'Faild to classify task.'
  }
  });
  }

  

completeTask(id:number):void {
  this.todoService.completeTodo(id).subscribe(() => {
   const todo= this.todos.find(t => t.id === id);
   if(todo) todo.completed = 1;
  });
}
deleteTask(id:number):void {
  this.todoService.deleteTodo(id).subscribe(() => {
    this.todos = this.todos.filter(t => t.id !== id);
  });

}

logout(): void {
  this.authService.logout();
  this.router.navigate(['/login']);
}

getTaskTextOnly(fullTask:string): string{
  return fullTask.replace(/\[(.*?)\]/, '');
}
getCategoryIcon(task: string): string{
  const match =task.match(/\[(.*?)\]/);
  const category= match ? match[1] : 'אחר';

  switch (category){
    case 'עבודה' : return 'fas fa-briefcase';
    case 'קניות': return 'fas fa-shopping-cart';
    case 'בית': return 'fas fa-home'; 
    case 'אישי': return 'fas fa-user';
    case 'אוכל': return 'fas fa-utensils';
    case 'ספורט': return 'fas fa-dumbbell';
    case 'קריאה' : return 'fas fa-book';
    case 'אחר': return 'fas fa-question-circle';
    default: return 'fas fa-question';
  }
}

}
