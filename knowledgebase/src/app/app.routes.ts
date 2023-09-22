import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/container/home-page-container.component').then(mod => mod.HomePageContainerComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/container/login-container.component').then(mod => mod.LoginContainerComponent)
  },
];
