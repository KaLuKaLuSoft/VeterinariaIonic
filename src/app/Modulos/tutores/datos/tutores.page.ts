import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, AlertController, IonSpinner, ActionSheetController, IonCheckbox, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, searchOutline, closeOutline, personOutline, mailOutline, callOutline, locationOutline, businessOutline, documentTextOutline, filterOutline, calendarOutline, starOutline, informationCircleOutline, pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline, cardOutline } from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { TutoresService, Dueño } from '../servicios/tutores.service';
import { CiudadService } from '../../ciudad/servicios/ciudad.service';
import { TipoDocumentoService } from '../servicios/tipodocumentos.service';
import { PaginatePipe } from '../../clientes/pipe/paginate.pipe'; // Reuse clients' paginate pipe
import { AppResumeService } from 'src/app/Globales/AppResumeService.service';
import { LoginService } from '../../login/servicios/login.service';

@Component({
    selector: 'app-tutores',
    templateUrl: './tutores.page.html',
    styleUrls: ['./tutores.page.scss'],
    standalone: true,
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, IonSpinner, IonCheckbox,
        CommonModule, FormsModule, ReactiveFormsModule, PaginatePipe
    ],
    providers: [AlertController, ActionSheetController, ToastController]
})
export class TutoresPage implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    isModalOpen = false;
    isEditing = false;
    isDetailModalOpen = false;
    selectedTutor: any = null;
    editingTutorId: number = 0;
    tutorForm: FormGroup;
    searchTerm: string = '';
    isLoading: boolean = true;

    private tutoresService = inject(TutoresService);
    private ciudadService = inject(CiudadService);
    private tipoDocumentoService = inject(TipoDocumentoService);
    private actionSheetController = inject(ActionSheetController);
    private toastController = inject(ToastController);

    ciudades: any[] = [];
    tiposDocumentos: any[] = [];
    selectedCiudadId: number | null = null;
    selectedFilterDoc: string | null = null; // Maybe filter by document type

    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public pagesOptions: number[] = [10, 20, 30, 40, 50];
    private loginService = inject(LoginService);
    private router = inject(Router);

    get totalPages(): number {
        return Math.ceil(this.tutoresFiltrados.length / this.itemsPerPage) || 1;
    }

    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
    prevPage() { if (this.currentPage > 1) this.currentPage--; }
    onItemsPerPageChange() { this.currentPage = 1; }

    ngOnInit() {
        this.cargarTutores();
        this.cargarCiudades();
        this.cargarTipoDocumentos();

        this.appResumeService.resume$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('Refrescando tutores...');
                this.cargarTutores(true);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarTipoDocumentos() {
        this.tipoDocumentoService.getTipoDocumentos().subscribe({
            next: (data) => {
                console.log('Respuesta TipoDocumentos API:', data);
                let listaDocs: any[] = [];
                if (Array.isArray(data)) {
                    listaDocs = data;
                } else if (data && Array.isArray(data.result)) {
                    listaDocs = data.result;
                }

                this.tiposDocumentos = listaDocs.map(t => ({
                    ...t,
                    id: t.id || t.Id,
                    tipoDocumento: t.tipoDocumento || t.TipoDocumento,
                    nombreTipo: t.nombreTipo || t.NombreTipo
                }));
            },
            error: (err) => {
                console.error('Error al cargar tipos de documentos:', err);
            }
        });
    }

    cargarCiudades() {
        this.ciudadService.getCiudades().subscribe({
            next: (data) => {
                this.ciudades = data;
            },
            error: (err) => {
                console.error('Error al cargar ciudades:', err);
            }
        });
    }

    onCiudadChange(event: any) {
        this.selectedCiudadId = event.target.value;
    }

    async abrirFiltros() {
        const botonesFiltro: any[] = this.tiposDocumentos.map(tipo => ({
            text: tipo.tipoDocumento || tipo.nombreTipo || 'Tipo ' + tipo.id,
            handler: () => {
                this.selectedFilterDoc = tipo.tipoDocumento || tipo.nombreTipo;
            }
        }));

        botonesFiltro.unshift({
            text: 'Todos los tutores',
            handler: () => {
                this.selectedFilterDoc = null;
            }
        });

        botonesFiltro.push({
            text: 'Cancelar',
            role: 'cancel',
            handler: () => { }
        });

        const actionSheet = await this.actionSheetController.create({
            header: 'Filtrar por Tipo Documento',
            buttons: botonesFiltro,
            mode: 'ios'
        });

        await actionSheet.present();
    }

    tutores: any[] = [];

    cargarTutores(esSilencioso: boolean = false) {
        if (!esSilencioso && this.tutores.length === 0) {
            this.isLoading = true;
        }

        this.tutoresService.getTutores().subscribe({
            next: (data) => {
                console.log('Respuesta Tutores API:', data);
                let lista = [];
                if (Array.isArray(data)) {
                    lista = data;
                } else if (data && Array.isArray(data.result)) {
                    lista = data.result;
                }
                this.tutores = lista.map((t: any) => ({
                    ...t,
                    id: t.id || t.Id,
                    codDuenos: t.codDueños || t.codDuenos || t.CodDueños,
                    numeroIdentificacion: t.numeroIdentificacion || t.NumeroIdentificacion,
                    nombreCompleto: t.nombreCompleto || t.NombreCompleto,
                    correoElectronico: t.correoElectronico || t.CorreoElectronico,
                    celular: t.celular || t.Celular,
                    direccion: t.direccion || t.Direccion,
                    idCiudad: t.idCiudad || t.IdCiudad,
                    nombreCiudad: t.nombreCiudad || t.NombreCiudad,
                    idTipoDocumento: t.idTipoDocumento || t.IdTipoDocumento,
                    tipoDocumento: t.tipoDocumento || t.TipoDocumento,
                    activo: t.activo !== undefined ? t.activo : t.Activo
                }));
                localStorage.setItem('cache_tutores', JSON.stringify(this.tutores));
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                console.warn('Error de conexión, manteniendo datos de caché.');
            }
        });
    }

    get tutoresFiltrados() {
        let filtrados = this.tutores || [];

        if (this.selectedFilterDoc) {
            filtrados = filtrados.filter(t => t.tipoDocumento === this.selectedFilterDoc);
        }

        if (!this.searchTerm || this.searchTerm.trim() === '') {
            return filtrados;
        }

        const termino = this.searchTerm.toLowerCase().trim();

        return filtrados.filter(tutor => {
            const nombre = String(tutor.nombreCompleto || '').toLowerCase();
            const email = String(tutor.correoElectronico || '').toLowerCase();
            const ident = String(tutor.numeroIdentificacion || '').toLowerCase();
            const cod = String(tutor.codDuenos || tutor.codDueños || '').toLowerCase();
            const celular = String(tutor.celular || '').toLowerCase();

            return nombre.includes(termino) ||
                email.includes(termino) ||
                ident.includes(termino) ||
                cod.includes(termino) ||
                celular.includes(termino);
        });
    }

    constructor(private alertController: AlertController, private appResumeService: AppResumeService) {
        addIcons({ addOutline, searchOutline, filterOutline, informationCircleOutline, pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline, closeOutline, personOutline, mailOutline, callOutline, locationOutline, documentTextOutline, calendarOutline, businessOutline, starOutline, cardOutline });

        this.tutorForm = new FormGroup({
            numeroIdentificacion: new FormControl('', [Validators.required]),
            nombreCompleto: new FormControl('', [Validators.required]),
            correoElectronico: new FormControl('', [Validators.email]),
            celular: new FormControl(''),
            direccion: new FormControl(''),
            idTipoDocumento: new FormControl(null, [Validators.required]),
            idCiudad: new FormControl(null, [Validators.required]),
            activo: new FormControl(true)
        });
    }

    setOpen(isOpen: boolean, editing: boolean = false, tutor: any = null) {
        this.isModalOpen = isOpen;
        this.isEditing = editing;

        if (isOpen) {
            if (editing && tutor) {
                this.editingTutorId = tutor.id;
                this.tutorForm.patchValue({
                    numeroIdentificacion: tutor.numeroIdentificacion,
                    nombreCompleto: tutor.nombreCompleto,
                    correoElectronico: tutor.correoElectronico,
                    celular: tutor.celular,
                    direccion: tutor.direccion,
                    idTipoDocumento: tutor.idTipoDocumento,
                    idCiudad: tutor.idCiudad,
                    activo: tutor.activo !== undefined ? tutor.activo : true
                });
            } else {
                this.editingTutorId = 0;
                this.tutorForm.reset({
                    idTipoDocumento: null,
                    idCiudad: null,
                    activo: true
                });
            }
        }
    }

    onSubmit() {
        if (this.tutorForm.invalid) return;

        const formData = this.tutorForm.value;

        const payload: any = {
            Id: 0,
            NumeroIdentificacion: formData.numeroIdentificacion,
            NombreCompleto: formData.nombreCompleto,
            CorreoElectronico: formData.correoElectronico,
            Celular: formData.celular ? Number(formData.celular) : 0,
            Direccion: formData.direccion || '',
            IdTipoDocumento: Number(formData.idTipoDocumento),
            IdCiudad: Number(formData.idCiudad),
            IdEmpresa: Number(this.tutoresService.getIdEmpresaFromToken()),
            Activo: formData.activo
        };

        if (this.isEditing) {
            const payloadEdit = { ...payload, Id: this.editingTutorId };
            this.tutoresService.putTutor(this.editingTutorId, payloadEdit).subscribe({
                next: (res) => {
                    this.setOpen(false);
                    this.notificar('Tutor actualizado correctamente', 'success');
                    this.cargarTutores(true);
                },
                error: (err) => {
                    console.error('Error al actualizar tutor:', err);
                    this.notificar('Error al actualizar tutor', 'danger');
                }
            });
        } else {
            this.tutoresService.postTutor(payload).subscribe({
                next: (res) => {
                    this.setOpen(false);
                    this.notificar('Tutor registrado correctamente', 'success');
                    this.cargarTutores();
                },
                error: (err) => {
                    console.error('Error al registrar tutor:', err);
                    this.notificar('Error al registrar el tutor', 'danger');
                }
            });
        }
    }

    async onDelete(tutor: any) {
        const alert = await this.alertController.create({
            header: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar a ${tutor.nombreCompleto}?`,
            mode: 'ios',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => {
                        this.isLoading = true;
                        this.tutoresService.deleteTutor(tutor.id).subscribe({
                            next: () => {
                                this.tutores = this.tutores.filter(t => t.id !== tutor.id);
                                localStorage.setItem('cache_tutores', JSON.stringify(this.tutores));
                                this.isLoading = false;
                                this.notificar('Tutor eliminado correctamente', 'success');
                                this.cargarTutores(true);
                            },
                            error: (err) => {
                                this.isLoading = false;
                                this.notificar('Error al intentar eliminar el tutor', 'danger');
                            }
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    openDetail(tutor: any) {
        this.selectedTutor = tutor;
        this.isDetailModalOpen = true;
    }

    closeDetail() {
        this.isDetailModalOpen = false;
        this.selectedTutor = null;
    }

    async notificar(mensaje: string, color: 'success' | 'danger') {
        const toast = await this.toastController.create({
            message: mensaje,
            duration: 2500,
            position: 'bottom',
            color: color,
            mode: 'ios',
            cssClass: 'custom-toast-right'
        });
        await toast.present();
    }

    irAlPerfil(tutor: any) {
        this.router.navigate(['/home/propietario', tutor.id]);
    }
}
