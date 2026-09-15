import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../api-url';

export type Todo = {
  id: number;
  task: string;
  completed: boolean;
  userId: number;
};

export type TodoFilter = 'all' | 'active' | 'done';

type TodosResponse = {
  todos: Todo[];
  nextCursor: number | null;
  hasMore: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly apiUrl = `${API_URL}/todos`;

  constructor(private http: HttpClient) {}

  getTodos(limit: number, cursor?: number, status: TodoFilter = 'all') {
    return this.http.get<TodosResponse>(this.apiUrl, {
      params: {
        limit,
        status,
        ...(cursor !== undefined && { cursor }),
      },
    });
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
