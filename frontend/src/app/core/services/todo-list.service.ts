import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../api-url';

export type TodoList = { id: number; name: string; userId: number };

@Injectable({ providedIn: 'root' })
export class TodoListService {
  private readonly apiUrl = `${API_URL}/lists`;
  constructor(private http: HttpClient) {}
  getLists() {
    return this.http.get<TodoList[]>(this.apiUrl);
  }
  createList(name: string) {
    return this.http.post<TodoList>(this.apiUrl, { name });
  }
  renameList(id: number, name: string) {
    return this.http.put<TodoList>(`${this.apiUrl}/${id}`, { name });
  }
  deleteList(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
