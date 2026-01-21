import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RepoButtonComponent } from './components/repo-button/repo-button.component';
import { AppStateService } from './services/state/app-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RepoButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly appState = inject(AppStateService);
}
