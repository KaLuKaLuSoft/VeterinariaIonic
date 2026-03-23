import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    IonContent, IonIcon, IonSpinner, IonModal,
    ToastController, AlertController, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    arrowBackOutline, cameraOutline, pawOutline, cartOutline,
    shieldCheckmarkOutline, addOutline, personOutline, barcodeOutline,
    callOutline, mailOutline, locationOutline, businessOutline,
    calendarOutline, documentTextOutline, checkmarkCircleOutline,
    closeCircleOutline, eyeOutline, receiptOutline, personRemoveOutline, closeOutline,
    chevronDownOutline, checkmarkOutline, optionsOutline, searchOutline, swapVerticalOutline,
    logoInstagram, logoFacebook, logoTwitter, logoLinkedin, logoTiktok,
    pencilOutline, trashOutline, removeOutline, caretDownOutline, caretUpOutline
} from 'ionicons/icons';

import { TutoresService } from '../../tutores/servicios/tutores.service';
import { MascotasService } from '../../mascotas/servicios/mascotas.service';

@Component({
    selector: 'app-propietario',
    templateUrl: './propietario.page.html',
    styleUrls: ['./propietario.page.scss'],
    standalone: true,
    imports: [
        IonContent, IonIcon, IonSpinner, IonModal,
        CommonModule, FormsModule
    ],
    providers: [ToastController, AlertController]
})
export class PropietarioPage implements OnInit, OnDestroy {

    tutorId: number = 0;
    tutor: any = null;
    mascotas: any[] = [];
    isLoading: boolean = true;
    isLoadingMascotas: boolean = false;

    activeTab: 'basico' | 'adicional' = 'basico';
    activeSection: 'pacientes' | 'compras' | 'planes' = 'pacientes';
    redesOpen: boolean = false;  // redes sociales colapsadas por defecto

    isSpeciesModalOpen: boolean = false;
    especies = [
        { id: 1, nombre: 'Canino', img: 'assets/especies/canino.png' },
        { id: 2, nombre: 'Felino', img: 'assets/especies/felino.png' },
        { id: 3, nombre: 'Equino', img: 'assets/especies/equino.png' },
        { id: 4, nombre: 'Bovino', img: 'assets/especies/bovino.png' },
        { id: 5, nombre: 'Porcino', img: 'assets/especies/porcino.png' },
        { id: 6, nombre: 'No Convencionales', img: 'assets/especies/exoticos.svg' }
    ];

    // ── Compras / Filtros ──
    serviciosDisponibles: string[] = [
        'Consulta Médica', 'Desparasitación', 'Vacuna', 'Estética',
        'Guardería', 'Hospitalización', 'Cirugía', 'Eutanasia',
        'Certificados', 'Exámenes', 'Nota Clínica', 'Fórmula',
        'Control Médico', 'Remisión a Especialista'
    ];
    comprasSeleccionadas: string[] = [];
    comprasDropdownOpen: boolean = false;
    compraFechaInicio: string = new Date().toISOString().split('T')[0];
    compraFechaFin: string = new Date().toISOString().split('T')[0];
    compraMascotaId: any = null;
    compraAccion: string = '';
    comprasPerPage: number = 10;
    todasLasCompras: any[] = [];  // se llenará con datos de la API

    get comprasFiltradas(): any[] {
        return this.todasLasCompras.filter(c => {
            if (this.compraMascotaId && c.idMascota !== Number(this.compraMascotaId)) return false;
            if (this.compraAccion && c.estadoPago !== this.compraAccion) return false;
            if (this.comprasSeleccionadas.length > 0 && !this.comprasSeleccionadas.includes(c.item)) return false;
            return true;
        });
    }

    private _dropdownListener!: (e: Event) => void;

    // Foto de perfil por defecto
    fotoUrl: string = 'assets/images/default-owner.png';

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private tutoresService = inject(TutoresService);
    private mascotasService = inject(MascotasService);
    private toastController = inject(ToastController);
    private alertController = inject(AlertController);
    private modalController = inject(ModalController);

    constructor() {
        addIcons({
            arrowBackOutline, cameraOutline, checkmarkCircleOutline, closeCircleOutline,
            barcodeOutline, personOutline, callOutline, mailOutline, locationOutline,
            businessOutline, calendarOutline, documentTextOutline, pawOutline, cartOutline,
            shieldCheckmarkOutline, addOutline, eyeOutline, closeOutline, chevronDownOutline,
            checkmarkOutline, optionsOutline, searchOutline, swapVerticalOutline,
            personRemoveOutline, receiptOutline, logoInstagram, logoFacebook, logoTwitter,
            logoLinkedin, logoTiktok, pencilOutline, trashOutline, removeOutline,
            caretDownOutline, caretUpOutline
        });
    }

    ngOnInit() {
        this.tutorId = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarTutor();

        // Verificar si debemos abrir el modal de especies automáticamente
        this.route.queryParams.subscribe(params => {
            if (params['openSpeciesSelection'] === 'true') {
                this.isSpeciesModalOpen = true;
            }
        });
    }

    ngOnDestroy() {
        if (this._dropdownListener) {
            document.removeEventListener('click', this._dropdownListener);
        }
    }

    cargarTutor() {
        this.isLoading = true;
        this.tutoresService.getTutores().subscribe({
            next: (data: any) => {
                let lista = [];
                if (Array.isArray(data)) lista = data;
                else if (data && Array.isArray(data.result)) lista = data.result;

                this.tutor = lista.find((t: any) => t.id === this.tutorId) || null;
                // Normalizar
                if (this.tutor) {
                    this.tutor.codDuenos = this.tutor.codDuenos || this.tutor.codDueños || this.tutor.CodDueños;
                }
                
                this.isLoading = false;
                if (this.tutor) {
                    this.cargarMascotas();
                }
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    cargarMascotas() {
        this.isLoadingMascotas = true;
        this.mascotasService.getMascotas().subscribe({
            next: (data: any[]) => {
                this.mascotas = data.filter((m: any) => m.idCliente === this.tutorId);
                this.isLoadingMascotas = false;
            },
            error: () => {
                this.isLoadingMascotas = false;
            }
        });
    }

    calcularEdad(fechaNacimiento: string): string {
        if (!fechaNacimiento) return '—';
        const hoy = new Date();
        const nac = new Date(fechaNacimiento);
        const diffMs = hoy.getTime() - nac.getTime();
        const totalDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const anios = Math.floor(totalDias / 365);
        const meses = Math.floor((totalDias % 365) / 30);
        if (anios > 0) return `${anios} año${anios > 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
        if (meses > 0) return `${meses} mes${meses !== 1 ? 'es' : ''}`;
        return `${totalDias} día${totalDias !== 1 ? 's' : ''}`;
    }

    onImgError(event: Event) {
        const img = event.target as HTMLImageElement;
        // Avatar SVG inline como fallback
        img.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="100" fill="#e8f5e9"/>
        <circle cx="100" cy="75" r="35" fill="#a5d6a7"/>
        <ellipse cx="100" cy="160" rx="55" ry="40" fill="#a5d6a7"/>
      </svg>
    `);
    }

    abrirNuevaMascota() {
        this.isSpeciesModalOpen = true;
    }

    seleccionarEspecie(especieId: number) {
        this.isSpeciesModalOpen = false;
        // Cerrar explícitamente cualquier modal abierto
        this.modalController.dismiss();
        
        // Pequeño retardo para asegurar que la animación inicie antes de cambiar de ruta
        setTimeout(() => {
            this.router.navigate(['/home/nuevo-paciente', this.tutorId, especieId]);
        }, 150);
    }

    cerrarModalEspecies() {
        this.isSpeciesModalOpen = false;
    }

    goBack() {
        this.router.navigate(['/home/tutores']);
    }

    // ── Multi-select de servicios ──
    toggleComprasDropdown(event: Event) {
        event.stopPropagation();
        this.comprasDropdownOpen = !this.comprasDropdownOpen;

        if (this.comprasDropdownOpen) {
            // Cerrar al hacer clic fuera
            this._dropdownListener = () => {
                this.comprasDropdownOpen = false;
            };
            setTimeout(() =>
                document.addEventListener('click', this._dropdownListener, { once: true })
                , 0);
        }
    }

    toggleServicio(servicio: string) {
        const idx = this.comprasSeleccionadas.indexOf(servicio);
        if (idx === -1) {
            this.comprasSeleccionadas = [...this.comprasSeleccionadas, servicio];
        } else {
            this.comprasSeleccionadas = this.comprasSeleccionadas.filter(s => s !== servicio);
        }
    }

    quitarServicio(servicio: string, event: Event) {
        event.stopPropagation();
        this.comprasSeleccionadas = this.comprasSeleccionadas.filter(s => s !== servicio);
    }

    // ── Redes Sociales ──
    toggleRedes() {
        this.redesOpen = !this.redesOpen;
    }

    // ── Gestión Administrativa ──
    editarInfoBasica() {
        // TODO: abrir modal de edición básica
        this.notificar('Funcionalidad en desarrollo', 'warning');
    }

    editarInfoAdicional() {
        // TODO: abrir modal de edición adicional
        this.notificar('Funcionalidad en desarrollo', 'warning');
    }

    async eliminarTutor() {
        const alert = await this.alertController.create({
            header: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar a <b>${this.tutor?.nombreCompleto}</b>?`,
            mode: 'ios',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => {
                        this.tutoresService.deleteTutor(this.tutorId).subscribe({
                            next: () => {
                                this.notificar('Tutor eliminado correctamente', 'success');
                                this.goBack();
                            },
                            error: () => this.notificar('Error al eliminar el tutor', 'danger')
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    async notificar(mensaje: string, tipo: 'success' | 'danger' | 'warning') {
        const toast = await this.toastController.create({
            message: mensaje,
            duration: 2500,
            position: 'bottom',
            color: tipo,
            mode: 'ios'
        });
        await toast.present();
    }
}
