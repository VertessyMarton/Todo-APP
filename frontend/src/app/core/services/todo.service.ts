import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export type Todo = {
  id: number;
  task: string;
  completed: boolean;
  userId: number;
};

type TodosResponse = {
  todos: Todo[];
};

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly apiUrl = 'https://todo-api-n26l.onrender.com/todos';

  constructor(private http: HttpClient) {}

  getTodos() {
    return this.http.get<TodosResponse>(this.apiUrl);
  }

  createTodo(task: string) {
    return this.http.post<Todo>(this.apiUrl, { task });
  }

  updateTodo(id: number, completed: boolean) {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, { completed });
  }

  deleteTodo(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
