import { Routes } from '@angular/router';
import { authGuard } from './modulos/login/guarda/auth.guard';

import { noAuthGuard } from './modulos/login/guarda/no-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modulos/login/datos/login.page').then((m) => m.LoginPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./modulos/dashboard/datos/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./modulos/clientes/datos/clientes.page').then((m) => m.ClientesPage),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'registro',
    loadComponent: () => import('./modulos/registro/registro.page').then( m => m.RegistroPage)
  },
];
