import { Routes } from '@angular/router';
import { LoginComponent } from './todo/components/login/login.component';
import { TodoListComponent } from './todo/components/todo-list/todo-list.component';
import { RegisterComponent } from './todo/components/register/register.component';

export const routes: Routes = [
    { path: '',redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {path: 'register', component: RegisterComponent},
    { path: 'todo', component: TodoListComponent },
];
