import { isDevMode } from '@angular/core';

export const API_URL = isDevMode()
  ? 'http://localhost:3000'
  : 'https://todo-api-n26l.onrender.com';
