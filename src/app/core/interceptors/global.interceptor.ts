import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, timer } from 'rxjs';
import { catchError, finalize, retry } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';

export const globalInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const toastService = inject(ToastService);

  // Start loading spinner
  loadingService.start();

  return next(req).pipe(
    // Retry strategy: retry up to 2 times for 5xx errors or network failures (status 0)
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 0 || error.status >= 500) {
          // Exponential backoff
          return timer(retryCount * 1000);
        }
        // Don't retry 4xx errors
        return throwError(() => error);
      }
    }),
    
    // Global Error Handler
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';
      if (error.error instanceof ErrorEvent) {
        errorMsg = `Error: ${error.error.message}`;
      } else {
        if (error.status === 0) {
          errorMsg = 'Error de conexión. Verifica tu internet o el estado del servidor.';
        } else if (error.status >= 500) {
          errorMsg = 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
        } else {
          // Use API provided message if available, otherwise generic
          errorMsg = error.error?.mensaje || `Error del servidor: ${error.status}`;
        }
      }
      
      toastService.showError(errorMsg);
      return throwError(() => error);
    }),
    
    // Always stop loading when request completes or errors
    finalize(() => {
      loadingService.stop();
    })
  );
};
