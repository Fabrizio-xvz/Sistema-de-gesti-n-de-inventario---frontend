import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="loader-bar">
        <div class="loader-progress"></div>
      </div>
    }
  `,
  styles: [`
    .loader-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      z-index: 99999;
      pointer-events: none;
      background: rgba(255, 255, 255, 0.2);
    }
    
    .loader-progress {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #60a5fa, #2563eb);
      background-size: 200% 100%;
      animation: load 1.5s infinite linear;
      transform-origin: left;
    }
    
    @keyframes load {
      0% { width: 0%; transform: translateX(0); }
      50% { width: 50%; transform: translateX(50vw); }
      100% { width: 100%; transform: translateX(100vw); }
    }
  `]
})
export class GlobalLoaderComponent {
  public loadingService = inject(LoadingService);
}
