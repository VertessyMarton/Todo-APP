import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TodosComponent } from './todos.component';

const lists = [
  { id: 1, name: 'My todos', userId: 7 },
  { id: 2, name: 'University', userId: 7 },
];
const todo = {
  id: 9,
  task: 'Read notes',
  completed: false,
  listId: 1,
  list: { id: 1, name: 'My todos' },
};
const page = (todos = [todo], hasMore = false, nextCursor: number | null = null) => ({
  todos,
  hasMore,
  nextCursor,
});

describe('TodosComponent list integration', () => {
  let component: TodosComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne((r) => r.url.endsWith('/lists')).flush(lists);
    http.expectOne((r) => r.url.endsWith('/todos') && !r.params.has('listId')).flush(page());
  });

  afterEach(() => http.verify());

  it('loads recent todos with their list names', () => {
    expect(component.selectedListId()).toBeUndefined();
    expect(component.todos()[0].list?.name).toBe('My todos');
    expect(component.lists()).toHaveLength(2);
  });

  it('keeps the selected list on subsequent pages', () => {
    component.selectList(1);
    http.expectOne((r) => r.params.get('listId') === '1').flush(page([todo], true, 9));
    component.loadMore();
    http
      .expectOne((r) => r.params.get('listId') === '1' && r.params.get('cursor') === '9')
      .flush(page([], false));
    expect(component.hasMore()).toBe(false);
  });

  it('ignores a response from a previously selected list', () => {
    component.selectList(1);
    const old = http.expectOne((r) => r.params.get('listId') === '1');
    component.selectList(2);
    http.expectOne((r) => r.params.get('listId') === '2').flush(page([]));
    old.flush(page());
    expect(component.todos()).toEqual([]);
  });

  it('sends the selected list when adding a task', () => {
    component.selectList(1);
    http.expectOne((r) => r.method === 'GET').flush(page([]));
    component.newTask.set('New task');
    component.addTodo();
    const request = http.expectOne((r) => r.method === 'POST');
    expect(request.request.body).toEqual({ task: 'New task', listId: 1 });
    request.flush({ ...todo, task: 'New task' });
    expect(component.todos()[0].task).toBe('New task');
  });

  it('preserves the list name when an update response omits the relation', () => {
    component.toggleTodo(todo);
    http
      .expectOne((r) => r.method === 'PUT')
      .flush({ id: 9, task: todo.task, completed: true, listId: 1 });
    expect(component.todos()[0].list?.name).toBe('My todos');
    expect(component.todos()[0].completed).toBe(true);
  });

  it('renames the list in recent todo labels', () => {
    component.startRename(lists[0]);
    component.editedName = 'Personal';
    component.renameList(1);
    http
      .expectOne((r) => r.method === 'PUT' && r.url.endsWith('/lists/1'))
      .flush({ ...lists[0], name: 'Personal' });
    expect(component.todos()[0].list?.name).toBe('Personal');
  });

  it('returns to recent todos after deleting the selected list', () => {
    component.selectList(1);
    http.expectOne((r) => r.method === 'GET').flush(page());
    component.deleteList(1);
    http.expectOne((r) => r.method === 'DELETE').flush({ message: 'TodoList deleted' });
    http.expectOne((r) => r.method === 'GET' && !r.params.has('listId')).flush(page([]));
    expect(component.selectedListId()).toBeUndefined();
    expect(component.lists().map((list) => list.id)).toEqual([2]);
  });

  it('keeps a list when deletion fails', () => {
    component.deleteList(1);
    http
      .expectOne((r) => r.method === 'DELETE')
      .flush({}, { status: 500, statusText: 'Server error' });
    expect(component.lists()).toHaveLength(2);
    expect(component.listError()).toContain('Could not delete');
    expect(component.listBusy()).toBe(false);
  });
  it('moves a todo and refreshes recent list labels', () => {
    component.destinationListId = 2;
    component.moveTodo(todo);
    const request = http.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/todos/9'));
    expect(request.request.body).toEqual({ listId: 2 });
    request.flush({ ...todo, listId: 2 });
    http
      .expectOne((r) => r.method === 'GET' && !r.params.has('listId'))
      .flush(page([{ ...todo, listId: 2, list: { id: 2, name: 'University' } }]));
    expect(component.todos()[0].list?.name).toBe('University');
    expect(component.pendingTodos()).toEqual([]);
  });

  it('removes a moved task from the selected list through a refresh', () => {
    component.selectList(1);
    http.expectOne((r) => r.method === 'GET').flush(page());
    component.destinationListId = 2;
    component.moveTodo(todo);
    http.expectOne((r) => r.method === 'PATCH').flush({ ...todo, listId: 2 });
    http.expectOne((r) => r.params.get('listId') === '1').flush(page([]));
    expect(component.todos()).toEqual([]);
  });

  it('keeps the task and allows retry when a move fails', () => {
    component.destinationListId = 2;
    component.moveTodo(todo);
    http.expectOne((r) => r.method === 'PATCH').flush({}, { status: 404, statusText: 'Not found' });
    expect(component.todos()[0].listId).toBe(1);
    expect(component.moveError()).toContain('Could not move');
    expect(component.pendingTodos()).toEqual([]);
  });

  it('does not move to the current list or submit twice while pending', () => {
    component.destinationListId = 1;
    component.moveTodo(todo);
    http.expectNone((r) => r.method === 'PATCH');
    component.destinationListId = 2;
    component.moveTodo(todo);
    component.moveTodo(todo);
    http.expectOne((r) => r.method === 'PATCH').flush({}, { status: 500, statusText: 'Error' });
  });
  it('shows a sign-out error and allows retry when revocation fails', () => {
    component.logout(true);
    expect(component.isSigningOut()).toBe(true);
    http
      .expectOne((r) => r.method === 'POST' && r.url.endsWith('/auth/logout/all'))
      .flush({}, { status: 500, statusText: 'Error' });
    expect(component.isSigningOut()).toBe(false);
    expect(component.signOutError()).toContain('Could not sign out from all devices');
  });
});
