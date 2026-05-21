import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [ngClass]="'toast--' + toast.type" (click)="toastService.remove(toast.id)">
          <div class="toast-icon">
            @if (toast.type === 'success') { <span>✓</span> }
            @if (toast.type === 'error') { <span>✕</span> }
            @if (toast.type === 'warning') { <span>!</span> }
            @if (toast.type === 'info') { <span>i</span> }
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button class="toast-close" (click)="toastService.remove(toast.id); $event.stopPropagation()">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      max-width: 450px;
      padding: 14px 18px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      border-left: 4px solid transparent;
    }

    .toast--success { border-left-color: #10b981; background: #f0fdf4; }
    .toast--error { border-left-color: #ef4444; background: #fef2f2; }
    .toast--warning { border-left-color: #f59e0b; background: #fffbeb; }
    .toast--info { border-left-color: #3b82f6; background: #eff6ff; }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-weight: bold;
      color: white;
    }

    .toast--success .toast-icon { background: #10b981; }
    .toast--error .toast-icon { background: #ef4444; }
    .toast--warning .toast-icon { background: #f59e0b; }
    .toast--info .toast-icon { background: #3b82f6; }

    .toast-message {
      flex: 1;
      font-size: 0.95rem;
      font-weight: 500;
      color: #1e293b;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .toast-close:hover {
      color: #475569;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastContainerComponent {
  public toastService = inject(ToastService);
}
