import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { NavController } from '@ionic/angular';

export const authGuard: CanActivateFn = (route, state) => {
    const navCtrl = inject(NavController);

    // Verificar directamente sessionStorage para evitar sobrecarga de inyección del servicio
    const token = sessionStorage.getItem('token');
    const isAuthenticated = !!token && typeof token !== 'undefined' && token !== '';

    if (!isAuthenticated) {
        // Si no está autenticado, redirigir al login sin animación
        navCtrl.navigateRoot(['/login'], { animated: false });
        return false;
    }

    return true;
};
