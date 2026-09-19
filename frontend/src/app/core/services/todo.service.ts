import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../api-url';

export type Todo = {
  id: number;
  task: string;
  completed: boolean;
  listId: number;
  list?: { id: number; name: string };
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

  getTodos(limit: number, cursor?: number, status: TodoFilter = 'all', listId?: number) {
    return this.http.get<TodosResponse>(this.apiUrl, {
      params: {
        limit,
        ...(listId !== undefined && { listId }),
        status,
        ...(cursor !== undefined && { cursor }),
      },
    });
  }

  createTodo(task: string, listId: number) {
    return this.http.post<Todo>(this.apiUrl, { task, listId });
  }

  updateTodo(id: number, completed: boolean) {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, { completed });
  }

  moveTodo(id: number, listId: number) {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, { listId });
  }

  deleteTodo(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
