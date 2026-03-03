import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, paw, personOutline, lockClosedOutline } from 'ionicons/icons';
import { LoginService } from '../servicios/login.service';
import { SharedDataService } from '../servicios/compartido/shared-data.service';
import {
    IonContent,
    IonInput,
    IonIcon,
    IonCheckbox,
    IonLabel
} from '@ionic/angular/standalone';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonContent,
        IonInput,
        IonIcon,
        IonCheckbox,
        IonLabel
    ],
})
export class LoginPage implements OnInit {
    hide = true;
    formulario: FormGroup;
    isLoggedIn = false;

    constructor(
        private loginService: LoginService,
        private router: Router,
        private sharedDataService: SharedDataService,
        private toastController: ToastController,
        private navCtrl: NavController
    ) {
        addIcons({ eyeOutline, eyeOffOutline, paw, personOutline, lockClosedOutline });

        // Inicializar el formulario con el control 'rememberMe'
        this.formulario = new FormGroup({
            usuario: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            rememberMe: new FormControl(false)
        });
    }

    ngOnInit() {
        // Cargar el usuario recordado si existe
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            this.formulario.patchValue({
                usuario: rememberedUser,
                rememberMe: true
            });
        }
    }

    togglePassword(): void {
        this.hide = !this.hide;
    }

    async onSubmit() {
        if (this.formulario.invalid) {
            console.log('Formulario inválido');
            return;
        }

        try {
            const response = await this.loginService.loginUser(this.formulario.value);
            console.log("Login: ", response);

            if (response.token && response.refreshToken) {
                sessionStorage.setItem('token', response.token);
                sessionStorage.setItem('refreshToken', response.refreshToken);
                localStorage.setItem('authenticated', 'true');

                const id = response.userData.id;
                const usuario = response.userData.usuario;
                const nombreSucursal = response.userData.sucursal.nombreSucursal;
                const roles = response.userData.roles;
                const idSucursal = response.userData.sucursal.id;
                const empleado = response.userData.empleado;
                const idEmpresa = response.userData.idEmpresa;
                const empresa = response.userData.empresa;
                const idPais = response.userData.idPais;
                //const idcaja = response.userData.caja.id;

                this.sharedDataService.setUserData(id, usuario, nombreSucursal, roles, idSucursal, empleado, idEmpresa, empresa, idPais);
                //this.sharedDataService.setUserData(id, usuario, nombreSucursal, roles, idSucursal, idcaja, empleado);

                sessionStorage.setItem('id', id.toString());
                sessionStorage.setItem('usuario', usuario);
                sessionStorage.setItem('nombreSucursal', nombreSucursal);
                sessionStorage.setItem('roles', roles);
                sessionStorage.setItem('idSucursal', idSucursal.toString());
                sessionStorage.setItem('empleado', empleado);
                sessionStorage.setItem("idEmpresa", idEmpresa.toString());
                sessionStorage.setItem("empresa", empresa);
                sessionStorage.setItem("idPais", idPais.toString());
                //sessionStorage.setItem('idcaja', idcaja.toString());

                // Manejar la funcionalidad "Recordarme"
                if (this.formulario.value.rememberMe) {
                    localStorage.setItem('rememberedUser', this.formulario.value.usuario);
                } else {
                    localStorage.removeItem('rememberedUser');
                }

                // Iniciar refresh automático del token
                this.loginService.scheduleRefresh();

                // Redirige a la URL original o a 'home' si no hay ninguna almacenada, y reemplaza la URL en el historial
                const redirectUrl = sessionStorage.getItem('redirectUrl') || '/home';
                sessionStorage.removeItem('redirectUrl');
                this.navCtrl.navigateRoot([redirectUrl], { animated: false });
            } else {
                localStorage.setItem('authenticated', 'false');
                console.log('No se recibieron tokens, no autenticado.');
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private async showSnackBar(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 5000,
            position: 'bottom',
            color: 'danger',
            buttons: [
                {
                    text: 'Cerrar',
                    role: 'cancel'
                }
            ]
        });
        await toast.present();
    }

    private handleError(error: any) {
        const serverMessage = error?.error?.Message ?? error?.error?.message ?? error?.message ?? 'Error desconocido';

        if (error?.status === 0) {
            this.showSnackBar('No se puede conectar con el servidor. Verifique su conexión o intente más tarde.');
        } else if (error?.status === 500) {
            this.showSnackBar('Error interno del servidor. Por favor, intente más tarde.');
        } else if (error?.status === 403 || /bloque|inactivo/i.test(serverMessage)) {
            // Mensaje para usuario bloqueado / inactivo
            this.showSnackBar('Usuario bloqueado. Póngase en contacto con el administrador.');
        } else if (error?.status === 401 || /usuario o contraseña/i.test(serverMessage)) {
            // Mensaje para credenciales inválidas
            this.showSnackBar(serverMessage || 'Usuario o Contraseña Incorrectos.');
        } else {
            // Otros errores
            this.showSnackBar(serverMessage);
        }

        localStorage.setItem('authenticated', 'false');
    }

    onForgotPassword(event: Event) {
        event.preventDefault();
        // Implement logic or navigation
    }
}
