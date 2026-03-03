import { Injectable, inject } from '@angular/core';
import { firstValueFrom, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router'; // Importa el Router para la redirección
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedDataService } from './compartido/shared-data.service';
import { LoginmenusService } from '../../usuarios/loginmenus/servicios/loginmenus.service';
import { NavController } from '@ionic/angular';

// Interfaz para la respuesta de autenticación
export interface AuthResponse {
  userData: any;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrlAuthenticate = 'https://localhost:7033/api/Login/Authenticate';
  private apiUrlRefreshToken = 'https://localhost:7033/api/Login/RefreshToken';
  private authenticationState = new BehaviorSubject<boolean>(this.isAuthenticated());

  private permittedMenus = new BehaviorSubject<number[]>([]);
  permittedMenus$ = this.permittedMenus.asObservable();
  private permittedMenusSubject = new BehaviorSubject<number[]>([]);

  private httpClient = inject(HttpClient);
  private router = inject(Router); // Inyecta el Router para poder redirigir
  private navCtrl = inject(NavController);

  constructor(
    private sharedDataService: SharedDataService,
    private loginmenusService: LoginmenusService,
  ) {
    this.loadStoredPermissions();
  }

  // Método para guardar los permisos en sessionStorage y en el observable
  setPermittedMenus(menuIds: number[]) {
    sessionStorage.setItem('menuPermissions', JSON.stringify(menuIds));
    this.permittedMenus.next(menuIds); // Actualiza el observable con los permisos actuales
  }

  // Método para cargar los permisos almacenados en sessionStorage
  private loadStoredPermissions() {
    const storedPermissions = sessionStorage.getItem('menuPermissions');
    if (storedPermissions) {
      const permissions = JSON.parse(storedPermissions);
      this.permittedMenus.next(permissions); // Actualiza el observable con los permisos cargados
    }
  }

  // Método para obtener los permisos actuales
  getCurrentPermissions(): number[] {
    return this.permittedMenusSubject.value;
  }


  // Método para el login de usuario
  loginUser(user: any): Promise<AuthResponse> {
    const loginData = {
      usuario: user.usuario,
      contrasena: user.password
    };

    return firstValueFrom(
      this.httpClient.post<AuthResponse>(this.apiUrlAuthenticate, loginData).pipe(
        catchError(error => {
          console.error("Error al iniciar sesión:", error);
          return throwError(() => error);
        })
      )
    ).then(response => {
      this.storeTokens(response.token, response.refreshToken);
      this.authenticationState.next(true);

      // Cargar menús permitidos del usuario
      if (response && response.userData) {
        const loginId = response.userData.id;
        this.loadUserMenus(loginId);
      } else {
        console.warn('Login Response missing userData:', response);
      }

      return response;
    });
  }

  private loadUserMenus(loginId: number): void {
    this.loginmenusService.getDataById(loginId).subscribe({
      next: (response: any) => {
        if (response && response.result && response.result.menuId) {
          const menuIds = Array.isArray(response.result.menuId) ? response.result.menuId : [response.result.menuId];
          this.setPermittedMenus(menuIds); // Guarda los permisos y actualiza el observable
        }
      },
      error: (error) => {
        console.error('Error al cargar los menús del usuario:', error);
      }
    });
  }

  public storeTokens(token: string, refreshToken: string): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  // Método para el refresh token
  refreshToken() {
    const token = this.getAuthToken();
    const refreshToken = this.getRefreshToken();

    if (!token || !refreshToken) {
      // ❌ CRITICO: throw lanazba una excepción síncrona que el interceptor no puede capturar
      // Ahora retornamos un Observable de error que sí puede manejar catchError
      console.warn('refreshToken(): No hay tokens en sesión, no se puede hacer refresh.');
      return throwError(() => new Error('No se encontraron tokens'));
    }

    const refreshData = {
      token: token,         // 🐛 FIJO: El API espera 'token' (sin s) en el body del POST
      refreshToken: refreshToken
    };

    console.log('📡 Enviando refresh token al servidor...');
    return this.httpClient.post<any>(this.apiUrlRefreshToken, refreshData);
  }

  // Obtiene el token de autenticación desde el sessionStorage
  getAuthToken() {
    return this.isBrowser() ? sessionStorage.getItem('token') || '' : '';
  }

  // Obtiene el refresh token desde el sessionStorage
  getRefreshToken() {
    return this.isBrowser() ? sessionStorage.getItem('refreshToken') || '' : '';
  }

  // Método de logout
  logout(): void {
    // Limpia el sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');

    // Cambia el estado de autenticación a false
    localStorage.setItem('authenticated', 'false');

    // Limpiar los datos de usuario, sucursal y roles
    this.sharedDataService.clearUserData(); // Limpiar datos en SharedDataService

    sessionStorage.removeItem('menuPermissions'); // Limpia permisos al cerrar sesión
    this.authenticationState.next(false);

    this.permittedMenusSubject.next([]);
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('nombreSucursal');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('idSucursal');
    sessionStorage.removeItem('empleado');
    sessionStorage.removeItem('idEmpresa');
    sessionStorage.removeItem('empresa');
    sessionStorage.removeItem('idPais');
    // Redirigir al usuario a la página de login
    this.navCtrl.navigateRoot(['/login'], { animated: false });

    console.log('Sesión cerrada correctamente.');
  }

  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token && typeof token !== 'undefined' && token !== '';
  }

  // Método que redirige al login si no está autenticado
  redirectToLoginIfNotAuthenticated(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  // Nueva forma de obtener el estado de autenticación como un observable
  getAuthState() {
    return this.authenticationState.asObservable();
  }

  setAuthenticatedState(isAuthenticated: boolean) {
    this.authenticationState.next(isAuthenticated); // Actualiza el estado de autenticación
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
  private refreshTimer?: any;

  // Método para programar el refresco automático del token
  public scheduleRefresh() {
    const token = this.getAuthToken();
    if (!token) {
      console.warn('scheduleRefresh: No hay token, no se programa refresco.');
      return;
    }

    try {
      // Decodificar el JWT para leer el tiempo de expiración
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresMs = payload.exp * 1000;
      const nowMs = Date.now();
      // Refrescar 30 segundos antes de que expire
      const timeoutMs = expiresMs - nowMs - (30 * 1000);

      // Cancelar cualquier timer anterior
      if (this.refreshTimer) clearTimeout(this.refreshTimer);

      if (timeoutMs > 0) {
        const mins = Math.round(timeoutMs / 60000);
        console.log(`🕐 Próximo refresh de token programado en ~${mins} minuto(s).`);
        this.refreshTimer = setTimeout(() => {
          this.refreshToken().subscribe({
            next: (res: any) => {
              console.log('✅ Token refrescado automáticamente en segundo plano.');
              this.storeTokens(res.tokens, res.refreshToken);
              this.scheduleRefresh(); // Programar el siguiente ciclo
            },
            error: (err: any) => {
              console.error('❌ Error en refresh automático:', err);
              // No hacer logout aquí — el interceptor manejará el 401 en la siguiente request
              // Solo logeamos y dejamos que el token expire naturalmente
            }
          });
        }, timeoutMs);
      } else {
        // Token ya expirado o a punto de expirar → refrescar inmediatamente
        console.warn('⚡ Token expirado o por expirar inmediatamente, refrescando ahora...');
        this.refreshToken().subscribe({
          next: (res: any) => {
            console.log('✅ Token refrescado inmediatamente.');
            this.storeTokens(res.tokens, res.refreshToken);
            this.scheduleRefresh(); // Programar siguiente ciclo con el token nuevo
          },
          error: (err: any) => {
            console.error('❌ No se pudo refrescar el token inmediatamente:', err);
          }
        });
      }
    } catch (e) {
      console.error('scheduleRefresh: Error al decodificar el token JWT.', e);
    }
  }
}

