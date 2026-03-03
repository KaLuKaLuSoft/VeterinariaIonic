import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AppResumeService } from './Globales/AppResumeService.service';
import { LoginService } from './modulos/login/servicios/login.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(
    private appResumeService: AppResumeService,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    // Si la sesión ya estaba activa al cargar la app, programar el refresh automático
    if (this.loginService.isAuthenticated()) {
      console.log('🔄 App iniciada con sesión activa — programando refresh automático.');
      this.loginService.scheduleRefresh();
    }

    // Al volver a la app (foco / reconexión), re-evaluar el token
    this.appResumeService.resume$.subscribe(() => {
      if (this.loginService.isAuthenticated()) {
        console.log('🔄 App reanudada — re-programando refresh de token.');
        this.loginService.scheduleRefresh();
      }
    });
  }
}
