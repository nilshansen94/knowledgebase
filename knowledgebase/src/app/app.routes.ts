import {Routes} from '@angular/router';
import {authGuard} from './services/auth/auth-guard';
import {PATHS} from './utils/paths';

export const routes: Routes = [
  {
    path: PATHS.HOME,
    canActivate: [authGuard()],
    loadComponent: () => import('./features/home/container/home-page-container.component').then(mod => mod.HomePageContainerComponent)
  },
  {
    path: PATHS.COMMUNITY,
    canActivate: [authGuard()],
    loadComponent: () => import('./features/community/container/community-container.component').then(mod => mod.CommunityContainerComponent)
  },
  {
    path: PATHS.PROFILE,
    canActivate: [authGuard()],
    loadComponent: () => import('./features/profile/container/profile-container.component').then(mod => mod.ProfileContainerComponent)
  },
  {
    path: PATHS.LOGIN,
    loadComponent: () => import('./features/login/container/login-container.component').then(mod => mod.LoginContainerComponent)
  },
  {
    path: PATHS.WELCOME,
    loadComponent: () => import('./features/welcome/container/welcome-container.component').then(mod => mod.WelcomeContainerComponent)
  },
  {
    path: PATHS.REGISTER,
    loadComponent: () => import('./features/registration/container/registration-container.component').then(mod => mod.RegistrationContainerComponent)
  },
  {
    path: PATHS.DEMO,
    loadComponent: () => import('./features/demo/container/demo-container.component').then(mod => mod.DemoContainerComponent)
  },
];
