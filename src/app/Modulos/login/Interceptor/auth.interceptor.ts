import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { LoginService } from '../servicios/login.service';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

// Helper para resetear el estado de refresco (evita que quede atascado)
function resetRefreshState() {
    isRefreshing = false;
    refreshTokenSubject = new BehaviorSubject<string | null>(null);
}

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {

    const loginService = inject(LoginService);

    // � No interceptar requests de autenticación ni de refresh token
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

            // Solo manejamos 401 (token expirado/inválido)
            if (error.status !== 401) {
                console.warn(`❌ HTTP Error ${error.status} en: ${req.url}`);
                return throwError(() => error);
            }

            console.warn(`🔑 Token expirado (401) en: ${req.url} — iniciando refresh...`);

            // 🔥 Si ya hay un refresh en curso → esperar a que termine
            if (isRefreshing) {
                console.log('⏳ Refresh en curso, esperando nuevo token...');
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

            // 🔥 Iniciar el proceso de refresh
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return loginService.refreshToken().pipe(
                catchError((err) => {
                    console.error('❌ Falló el refresh token — cerrando sesión.', err);
                    resetRefreshState();
                    loginService.logout();
                    // Lanzamos el error para detener el flujo, pero marcándolo
                    return throwError(() => err);
                }),
                switchMap((response: any) => {
                    const newToken = response.tokens;
                    const newRefreshToken = response.refreshToken;

                    if (!newToken) {
                        console.error('❌ El servidor no retornó un token en la respuesta de refresh.');
                        resetRefreshState();
                        loginService.logout();
                        return throwError(() => new Error('Respuesta de refresh inválida'));
                    }

                    console.log('✅ Token refrescado exitosamente por el interceptor.');

                    // Guardar nuevos tokens (delegar al servicio para centralizar)
                    loginService.storeTokens(newToken, newRefreshToken);

                    isRefreshing = false;
                    refreshTokenSubject.next(newToken);

                    // Reintentar la request original con el nuevo token
                    // Si este request vuelve a fallar, el error no pasará por el catchError superior
                    // y el componente podrá manejarlo libremente (sin cerrar sesión).
                    return next(req.clone({
                        setHeaders: { Authorization: `Bearer ${newToken}` }
                    }));
                })
            );
        })
    );
};
