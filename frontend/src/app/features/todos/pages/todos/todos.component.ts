import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Todo, TodoService } from '../../../../core/services/todo.service';

type TodoFilter = 'all' | 'active' | 'done';

@Component({
  selector: 'app-todos',
  imports: [FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss',
})
export class TodosComponent implements OnInit {
  todos = signal<Todo[]>([]);
  newTask = signal('');
  filter = signal<TodoFilter>('all');
  errorMessage = signal('');
  isLoading = signal(false);
  isAdding = signal(false);

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
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.todoService.getTodos().subscribe({
      next: (response) => {
        this.todos.set(response.todos);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load your todos.');
        this.isLoading.set(false);
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
        this.todos.update((todos) => [todo, ...todos]);
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
    this.filter.set(filter);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
