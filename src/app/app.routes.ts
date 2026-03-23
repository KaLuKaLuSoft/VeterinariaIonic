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
      {
        path: 'mascotas',
        loadComponent: () => import('./modulos/mascotas/datos/mascotas.page').then((m) => m.MascotasPage),
      },
      {
        path: 'propietario/:id',
        loadComponent: () => import('./modulos/clientes/propietario/propietario.page').then((m) => m.PropietarioPage),
      },
      {
        path: 'nuevo-paciente/:idTutor/:idEspecie',
        loadComponent: () => import('./modulos/mascotas/datos/paciente-form/paciente-form.page').then(m => m.NuevoPacientePage),
      },
      {
        path: 'tutores',
        loadComponent: () => import('./modulos/tutores/datos/tutores.page').then((m) => m.TutoresPage),
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
    loadComponent: () => import('./modulos/registro/registro.page').then(m => m.RegistroPage)
  },
];
