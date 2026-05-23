import { HttpInterceptorFn } from '@angular/common/http';
import { API_URL } from '../api-url';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');

  if (!token || !req.url.startsWith(API_URL)) {
    return next(req);
  }

  const requestWithToken = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(requestWithToken);
};
