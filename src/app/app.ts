import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppFooterComponent } from './components/layout/app-footer.component';
import { AppNavbarComponent } from './components/layout/app-navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppNavbarComponent, AppFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
