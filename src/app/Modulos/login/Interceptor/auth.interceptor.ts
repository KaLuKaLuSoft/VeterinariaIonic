import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { LoginService } from '../servicios/login.service';
import { ToastController } from '@ionic/angular';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

function resetRefreshState() {
    isRefreshing = false;
    refreshTokenSubject = new BehaviorSubject<string | null>(null);
}

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const loginService = inject(LoginService);
    const toastController = inject(ToastController);

    // Función auxiliar para mostrar el snackbar en la posición correcta
    const showConnectionToast = async () => {
        const toast = await toastController.create({
            message: '⚠️ No se pudo establecer conexión con el servidor. Verifique su conexión.',
            duration: 5000,
            position: 'bottom',
            cssClass: 'custom-toast-right',
            mode: 'ios',
            buttons: [
                {
                    text: 'Cerrar',
                    role: 'cancel'
                }
            ]
        });
        await toast.present();
    };

    const excludedUrls = ['/Login/Authenticate', '/Login/RefreshToken'];
    const isExcluded = excludedUrls.some(url => req.url.includes(url));

    if (isExcluded) {
        return next(req);
    }

    const token = sessionStorage.getItem('token');
    let clonedReq = req;

    if (token) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(clonedReq).pipe(
        catchError((error) => {
            // Error de conexión (Status 0)
            if (error.status === 0) {
                console.error(`❌ Error de conexión al intentar acceder a: ${req.url}`);
                showConnectionToast();
                return throwError(() => error);
            }

            // Solo manejamos 401
            if (error.status !== 401) {
                return throwError(() => error);
            }

            if (isRefreshing) {
                return refreshTokenSubject.pipe(
                    filter(t => t !== null),
                    take(1),
                    switchMap((newToken) => {
                        return next(req.clone({
                            setHeaders: { Authorization: `Bearer ${newToken}` }
                        }));
                    })
                );
            }

            isRefreshing = true;
            refreshTokenSubject.next(null);

            return loginService.refreshToken().pipe(
                catchError((err) => {
                    resetRefreshState();
                    loginService.logout();
                    return throwError(() => err);
                }),
                switchMap((response: any) => {
                    const newToken = response.tokens;
                    const newRefreshToken = response.refreshToken;

                    if (!newToken) {
                        resetRefreshState();
                        loginService.logout();
                        return throwError(() => new Error('Refresh failed'));
                    }

                    loginService.storeTokens(newToken, newRefreshToken);
                    isRefreshing = false;
                    refreshTokenSubject.next(newToken);

                    return next(req.clone({
                        setHeaders: { Authorization: `Bearer ${newToken}` }
                    }));
                })
            );
        })
    );
};
