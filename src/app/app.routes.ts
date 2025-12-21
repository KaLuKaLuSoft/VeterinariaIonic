import { Routes } from '@angular/router';
import { authGuard } from './Modulos/login/Guarda/auth.guard';

import { noAuthGuard } from './Modulos/login/Guarda/no-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./Modulos/login/Datos/login.page').then((m) => m.LoginPage),
    canActivate: [noAuthGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./Modulos/Dashboard/Datos/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./Modulos/Clientes/Datos/clientes.page').then((m) => m.ClientesPage),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
