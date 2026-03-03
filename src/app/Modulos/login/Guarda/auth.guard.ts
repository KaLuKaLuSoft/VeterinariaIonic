import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { NavController } from '@ionic/angular';

export const authGuard: CanActivateFn = (route, state) => {
    const navCtrl = inject(NavController);

    const token = sessionStorage.getItem('token');

    if (!token) {
        navCtrl.navigateRoot(['/login'], { animated: false });
        return false;
    }

    // Verificar si el JWT está expirado
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expMs = payload.exp * 1000;
        const nowMs = Date.now();

        // Dar 60 segundos de gracia: si falta menos de 60s para expirar,
        // el interceptor intentará refrescar automáticamente en la siguiente request.
        // Solo bloqueamos si ya expiró hace más de 60 segundos.
        const isExpired = expMs < (nowMs - 60_000);

        if (isExpired) {
            console.warn('authGuard: Token expirado, redirigiendo al login.');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            navCtrl.navigateRoot(['/login'], { animated: false });
            return false;
        }
    } catch (e) {
        // Si el token no puede decodificarse, es inválido
        console.error('authGuard: Token inválido o malformado.');
        navCtrl.navigateRoot(['/login'], { animated: false });
        return false;
    }

    return true;
};
