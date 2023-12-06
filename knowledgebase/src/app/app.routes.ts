import {Routes} from '@angular/router';
import {authGuard} from './services/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard()],
    //canActivate: [AuthGuardService],
    loadComponent: () => import('./features/home/container/home-page-container.component').then(mod => mod.HomePageContainerComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/container/login-container.component').then(mod => mod.LoginContainerComponent)
  },
];
