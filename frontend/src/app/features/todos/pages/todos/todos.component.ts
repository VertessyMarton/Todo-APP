import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Todo, TodoFilter, TodoService } from '../../../../core/services/todo.service';

@Component({
  selector: 'app-todos',
  imports: [FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss',
})
export class TodosComponent implements OnInit {
  private readonly pageSize = 15;
  private requestVersion = 0;

  todos = signal<Todo[]>([]);
  newTask = signal('');
  filter = signal<TodoFilter>('all');
  errorMessage = signal('');
  isLoading = signal(false);
  isAdding = signal(false);
  nextCursor = signal<number | null>(null);
  hasMore = signal(true);
  isLoadingMore = signal(false);

  visibleTodos = computed(() => {
    const todos = this.todos();

    if (this.filter() === 'active') {
      return todos.filter((todo) => !todo.completed);
    }

    if (this.filter() === 'done') {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  });

  constructor(
    private todoService: TodoService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    const requestVersion = ++this.requestVersion;

    this.errorMessage.set('');
    this.isLoading.set(true);
    this.isLoadingMore.set(false);
    this.nextCursor.set(null);
    this.hasMore.set(true);

    this.todoService.getTodos(this.pageSize, undefined, this.filter()).subscribe({
      next: (response) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.todos.set(response.todos);
        this.nextCursor.set(response.nextCursor);
        this.hasMore.set(response.hasMore);
        this.isLoading.set(false);
      },
      error: () => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.errorMessage.set('Could not load your todos.');
        this.isLoading.set(false);
      },
    });
  }

  loadMore() {
    const cursor = this.nextCursor();
    const requestVersion = this.requestVersion;

    if (cursor === null || !this.hasMore() || this.isLoadingMore()) {
      return;
    }

    this.errorMessage.set('');
    this.isLoadingMore.set(true);

    this.todoService.getTodos(this.pageSize, cursor, this.filter()).subscribe({
      next: (response) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.todos.update((todos) => [...todos, ...response.todos]);
        this.nextCursor.set(response.nextCursor);
        this.hasMore.set(response.hasMore);
        this.isLoadingMore.set(false);
      },
      error: () => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        this.errorMessage.set('Could not load more todos.');
        this.isLoadingMore.set(false);
      },
    });
  }

  addTodo() {
    const task = this.newTask().trim();

    if (!task || this.isAdding()) {
      return;
    }

    this.errorMessage.set('');
    this.isAdding.set(true);

    this.todoService.createTodo(task).subscribe({
      next: (todo) => {
        if (this.filter() !== 'done') {
          this.todos.update((todos) => [todo, ...todos]);
        }
        this.newTask.set('');
        this.isAdding.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not add this todo.');
        this.isAdding.set(false);
      },
    });
  }

  toggleTodo(todo: Todo) {
    this.errorMessage.set('');

    this.todoService.updateTodo(todo.id, !todo.completed).subscribe({
      next: (updatedTodo) => {
        this.todos.update((todos) =>
          todos.map((item) => (item.id === updatedTodo.id ? updatedTodo : item)),
        );
      },
      error: () => {
        this.errorMessage.set('Could not update this todo.');
      },
    });
  }

  deleteTodo(id: number) {
    this.errorMessage.set('');

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
      },
      error: () => {
        this.errorMessage.set('Could not delete this todo.');
      },
    });
  }

  setFilter(filter: TodoFilter) {
    if (filter === this.filter()) {
      return;
    }

    this.filter.set(filter);
    this.loadTodos();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
