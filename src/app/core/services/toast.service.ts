import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(type: ToastType, message: string, durationMs: number = 5000): void {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    this.toasts.update(current => [...current, { id, type, message }]);

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  showSuccess(message: string): void {
    this.show('success', message);
  }

  showError(message: string): void {
    this.show('error', message);
  }

  showWarning(message: string): void {
    this.show('warning', message);
  }

  showInfo(message: string): void {
    this.show('info', message);
  }

  remove(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
