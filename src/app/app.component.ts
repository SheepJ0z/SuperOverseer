import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatCardModule, CommonModule, RouterLink, RouterOutlet, MatSlideToggleModule, NgOptimizedImage, MatTabsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  navLinks = [
    {
      label: '存档',
      link: 'save'
    },
    {
      label: '避难所管理',
      link: 'vault'
    },
    {
      label: '居民管理',
      link: 'dwellers'
    },
  ];

  activeLink: string | null = null;

}
