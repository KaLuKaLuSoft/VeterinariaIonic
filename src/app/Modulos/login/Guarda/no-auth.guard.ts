import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { NavController } from '@ionic/angular';

export const noAuthGuard: CanActivateFn = (route, state) => {
    const navCtrl = inject(NavController);

    // Verificar directamente sessionStorage para evitar sobrecarga de inyección del servicio
    const token = sessionStorage.getItem('token');
    const isAuthenticated = !!token && typeof token !== 'undefined' && token !== '';

    if (isAuthenticated) {
        // Si ya está autenticado, redirigir a Home sin animación y bloquear entrada al login
        navCtrl.navigateRoot(['/home'], { animated: false });
        return false;
    }

    return true;
};
