import { Component, OnInit, computed, signal } from '@angular/core';
import { TodoList, TodoListService } from '../../../../core/services/todo-list.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Todo, TodoFilter, TodoService } from '../../../../core/services/todo.service';

@Component({
  selector: 'app-todos',
  host: { '(document:click)': 'dismissTodoMenu($event)' },
  imports: [FormsModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.scss',
})
export class TodosComponent implements OnInit {
  private readonly pageSize = 15;
  private requestVersion = 0;

  lists = signal<TodoList[]>([]);
  selectedListId = signal<number | undefined>(undefined);
  selectedList = computed(() => this.lists().find((list) => list.id === this.selectedListId()));
  listsLoading = signal(false);
  listError = signal('');
  listBusy = signal(false);
  newListName = '';
  editingListId = signal<number | null>(null);
  editedName = '';
  deletingListId = signal<number | null>(null);
  pendingTodos = signal<number[]>([]);
  openTodoMenu = signal<number | null>(null);
  showMovePicker = signal(false);
  destinationListId: number | null = null;
  moveError = signal('');

  dismissTodoMenu(event: Event) {
    if (!(event.target instanceof Element) || !event.target.closest('.todo-actions')) {
      this.openTodoMenu.set(null);
    }
  }

  toggleTodoMenu(id: number) {
    this.openTodoMenu.set(this.openTodoMenu() === id ? null : id);
    this.showMovePicker.set(false);
    this.destinationListId = null;
    this.moveError.set('');
  }

  moveTodo(todo: Todo) {
    const listId = this.destinationListId;
    const list = this.lists().find((item) => item.id === listId);
    if (!list || list.id === todo.listId || this.pendingTodos().includes(todo.id)) return;
    this.pendingTodos.update((ids) => [...ids, todo.id]);
    this.moveError.set('');
    this.todoService.moveTodo(todo.id, list.id).subscribe({
      next: () => {
        this.pendingTodos.update((ids) => ids.filter((id) => id !== todo.id));
        this.openTodoMenu.set(null);
        // Reload the current view so list membership, labels, and pagination agree.
        this.loadTodos();
      },
      error: () => {
        this.pendingTodos.update((ids) => ids.filter((id) => id !== todo.id));
        this.moveError.set('Could not move this todo. Please try again.');
      },
    });
  }

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
    private listService: TodoListService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadLists();
    this.loadTodos();
  }

  loadTodos() {
    this.openTodoMenu.set(null);
    const requestVersion = ++this.requestVersion;

    this.errorMessage.set('');
    this.isLoading.set(true);
    this.isLoadingMore.set(false);
    this.nextCursor.set(null);
    this.hasMore.set(false);
    this.todos.set([]);

    this.todoService
      .getTodos(this.pageSize, undefined, this.filter(), this.selectedListId())
      .subscribe({
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

    this.todoService
      .getTodos(this.pageSize, cursor, this.filter(), this.selectedListId())
      .subscribe({
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

    const listId = this.selectedListId();
    const requestVersion = this.requestVersion;
    if (task.length < 3 || listId === undefined || this.isAdding()) {
      return;
    }

    this.errorMessage.set('');
    this.isAdding.set(true);

    this.todoService.createTodo(task, listId).subscribe({
      next: (todo) => {
        if (requestVersion === this.requestVersion && this.filter() !== 'done') {
          this.todos.update((todos) => [todo, ...todos]);
        }
        if (requestVersion === this.requestVersion) this.newTask.set('');
        this.isAdding.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not add this todo.');
        this.isAdding.set(false);
      },
    });
  }

  toggleTodo(todo: Todo) {
    if (this.pendingTodos().includes(todo.id)) return;
    this.pendingTodos.update((ids) => [...ids, todo.id]);
    this.errorMessage.set('');

    this.todoService.updateTodo(todo.id, !todo.completed).subscribe({
      next: (updatedTodo) => {
        this.pendingTodos.update((ids) => ids.filter((id) => id !== todo.id));
        this.todos.update((todos) =>
          todos.map((item) => (item.id === updatedTodo.id ? { ...item, ...updatedTodo } : item)),
        );
      },
      error: () => {
        this.pendingTodos.update((ids) => ids.filter((id) => id !== todo.id));
        this.errorMessage.set('Could not update this todo.');
      },
    });
  }

  deleteTodo(id: number) {
    if (this.pendingTodos().includes(id)) return;
    this.pendingTodos.update((ids) => [...ids, id]);
    this.errorMessage.set('');

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.pendingTodos.update((ids) => ids.filter((item) => item !== id));
        this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
      },
      error: () => {
        this.pendingTodos.update((ids) => ids.filter((item) => item !== id));
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

  loadLists() {
    this.listsLoading.set(true);
    this.listError.set('');
    this.listService.getLists().subscribe({
      next: (lists) => {
        this.lists.set(lists);
        this.listsLoading.set(false);
      },
      error: () => {
        this.listError.set('Could not load your lists. Try again.');
        this.listsLoading.set(false);
      },
    });
  }

  selectList(id?: number) {
    if (this.selectedListId() === id) return;
    this.selectedListId.set(id);
    this.filter.set('all');
    this.newTask.set('');
    this.loadTodos();
  }

  createList() {
    const name = this.newListName.trim();
    if (name.length < 3 || name.length > 100 || this.listBusy()) return;
    this.listBusy.set(true);
    this.listError.set('');
    this.listService.createList(name).subscribe({
      next: (list) => {
        this.lists.update((lists) => [...lists, list]);
        this.newListName = '';
        this.listBusy.set(false);
        this.selectList(list.id);
      },
      error: () => {
        this.listBusy.set(false);
        this.listError.set('Could not create this list. Please try again.');
      },
    });
  }

  startRename(list: TodoList) {
    this.editingListId.set(list.id);
    this.editedName = list.name;
    this.deletingListId.set(null);
  }

  renameList(id: number) {
    const name = this.editedName.trim();
    if (name.length < 3 || name.length > 100 || this.listBusy()) return;
    this.listBusy.set(true);
    this.listError.set('');
    this.listService.renameList(id, name).subscribe({
      next: (updated) => {
        this.lists.update((lists) => lists.map((list) => (list.id === id ? updated : list)));
        this.todos.update((todos) =>
          todos.map((todo) =>
            todo.listId === id ? { ...todo, list: { id, name: updated.name } } : todo,
          ),
        );
        this.editingListId.set(null);
        this.listBusy.set(false);
      },
      error: () => {
        this.listBusy.set(false);
        this.listError.set('Could not rename this list. Please try again.');
      },
    });
  }

  deleteList(id: number) {
    if (this.listBusy()) return;
    this.listBusy.set(true);
    this.listError.set('');
    this.listService.deleteList(id).subscribe({
      next: () => {
        this.lists.update((lists) => lists.filter((list) => list.id !== id));
        this.deletingListId.set(null);
        this.listBusy.set(false);
        if (this.selectedListId() === id) this.selectList();
        else this.loadTodos();
      },
      error: () => {
        this.listBusy.set(false);
        this.listError.set('Could not delete this list. Please try again.');
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
