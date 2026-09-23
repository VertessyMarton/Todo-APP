import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { API_URL } from '../api-url';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiRequest = req.url === API_URL || req.url.startsWith(`${API_URL}/`);
  if (!apiRequest || req.url.startsWith(`${API_URL}/auth/`)) return next(req);

  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  if (!token) return next(req);

  const authorized = (value: string) =>
    req.clone({
      setHeaders: { Authorization: `Bearer ${value}` },
    });
  const expireSession = () => {
    auth.clearToken();
    void router.navigate(['/login']);
  };

  return next(authorized(token)).pipe(
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      const currentToken = auth.getToken();
      if (!currentToken) return throwError(() => error);
      // A late 401 may belong to a token another request already refreshed.
      const replacement = currentToken !== token ? of(currentToken) : auth.refreshAccessToken();
      return replacement.pipe(
        catchError((refreshError) => {
          if (refreshError instanceof HttpErrorResponse && refreshError.status === 401)
            expireSession();
          return throwError(() => refreshError);
        }),
        switchMap((newToken) =>
          next(authorized(newToken)).pipe(
            catchError((retryError) => {
              if (retryError instanceof HttpErrorResponse && retryError.status === 401)
                expireSession();
              return throwError(() => retryError);
            }),
          ),
        ),
      );
    }),
  );
};
