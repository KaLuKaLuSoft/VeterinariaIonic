import { Injectable, inject } from '@angular/core';
import { fromEvent, merge, BehaviorSubject, map, throttleTime } from 'rxjs';
import { LoginService } from '../modulos/login/servicios/login.service';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class ConnectivityMonitor {
    
    private loginService = inject(LoginService);
    private toastController = inject(ToastController);

    // Estado de red
    private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
    public isOnline$ = this.onlineStatus.asObservable();

    // Temporizador de inactividad de PESTAÑA (Cuando el usuario sale de la pestaña o minimiza)
    private pageIdleTimer?: any;
    private readonly PAGE_IDLE_LIMIT_MS = 10 * 60 * 1000; // 10 Minutos

    // Temporizador de inactividad de INTERACCIÓN (Cuando el usuario no toca nada aunque la app esté abierta)
    private userIdleTimer?: any;
    private readonly USER_IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 Minutos de inactividad absoluta

    constructor() {
        this.startMonitoring();
    }

    private startMonitoring() {
        // 1. Monitoreo de Red
        merge(
            fromEvent(window, 'online').pipe(map(() => true)),
            fromEvent(window, 'offline').pipe(map(() => false))
        ).subscribe(isOnline => {
            this.onlineStatus.next(isOnline);
            if (isOnline) {
                this.handleOnline();
            } else {
                this.handleOffline();
            }
        });

        // 2. Monitoreo de Visibilidad (Seguridad al salir de la pestaña)
        merge(
            fromEvent(window, 'blur'),
            fromEvent(window, 'visibilitychange')
        ).subscribe(() => {
            if (document.visibilityState === 'hidden' || !document.hasFocus()) {
                this.startPageIdleTimer();
            } else {
                this.clearPageIdleTimer();
            }
        });

        fromEvent(window, 'focus').subscribe(() => this.clearPageIdleTimer());

        // 3. Monitoreo de Interacción del Usuario (Actividad del ratón, teclado, etc.)
        const interactionEvents = merge(
            fromEvent(window, 'mousemove'),
            fromEvent(window, 'mousedown'),
            fromEvent(window, 'keypress'),
            fromEvent(window, 'touchstart'),
            fromEvent(window, 'scroll')
        ).pipe(throttleTime(5000)); // Chequear solo cada 5 segundos para no saturar memoria

        interactionEvents.subscribe(() => {
            this.resetUserIdleTimer();
        });

        this.resetUserIdleTimer(); // Iniciar contador de inactividad al arrancar
    }

    // --- Lógica de Red ---
    private async handleOnline() {
        const toast = await this.toastController.create({
            message: '🌐 Conexión restaurada.',
            duration: 2500,
            position: 'bottom',
            cssClass: 'custom-toast-right',
            color: 'success',
            mode: 'ios'
        });
        await toast.present();
        if (this.loginService.isAuthenticated()) {
            this.loginService.syncSession();
        }
    }

    private async handleOffline() {
        const toast = await this.toastController.create({
            message: '📶 Sin conexión — Modo espera.',
            duration: 4000,
            position: 'bottom',
            cssClass: 'custom-toast-right',
            color: 'warning',
            mode: 'ios'
        });
        await toast.present();
    }

    // --- Lógica de Seguridad (Page Idle - Salir de la pestaña) ---
    private startPageIdleTimer() {
        if (!this.loginService.isAuthenticated()) return;
        this.clearPageIdleTimer();
        this.pageIdleTimer = setTimeout(() => {
            console.warn('🕒 Tiempo fuera de la app agotado — Logout por seguridad.');
            this.loginService.logout();
        }, this.PAGE_IDLE_LIMIT_MS);
    }

    private clearPageIdleTimer() {
        if (this.pageIdleTimer) {
            clearTimeout(this.pageIdleTimer);
            this.pageIdleTimer = null;
        }
    }

    // --- Lógica de Inactividad de Usuario (Interacción) ---
    private resetUserIdleTimer() {
        if (!this.loginService.isAuthenticated()) return;

        if (this.userIdleTimer) {
            clearTimeout(this.userIdleTimer);
        }

        this.userIdleTimer = setTimeout(() => {
            console.warn('🚫 Inactividad total del usuario detectada — Logout por seguridad.');
            this.loginService.logout();
        }, this.USER_IDLE_LIMIT_MS);
    }
}
