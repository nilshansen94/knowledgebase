import {Routes} from '@angular/router';
import {authGuard} from './services/auth/auth-guard';
import {PATH} from './utils/paths';

export const routes: Routes = [
  {
    path: PATH.HOME,
    canActivate: [authGuard()],
    loadComponent: () => import('./features/home/container/home-page-container.component').then(mod => mod.HomePageContainerComponent)
  },
  {
    path: PATH.COMMUNITY,
    canActivate: [authGuard()],
    loadComponent: () => import('./features/community/container/community-container.component').then(mod => mod.CommunityContainerComponent)
  },
  {
    path: PATH.LOGIN,
    loadComponent: () => import('./features/login/container/login-container.component').then(mod => mod.LoginContainerComponent)
  },
  {
    path: PATH.REGISTER,
    loadComponent: () => import('./features/registration/container/registration-container.component').then(mod => mod.RegistrationContainerComponent)
  },
];
