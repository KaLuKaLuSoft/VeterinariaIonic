import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, AlertController, IonSpinner, ActionSheetController, IonCheckbox, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, searchOutline, closeOutline, personOutline, mailOutline, callOutline, locationOutline, businessOutline, documentTextOutline, filterOutline, calendarOutline, starOutline, informationCircleOutline, pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { Subject } from 'rxjs';

import { ClientesService, Cliente } from '../servicios/clientes.service';
import { CiudadService } from '../../ciudad/servicios/ciudad.service';
import { TipoClienteService } from '../../tipocliente/servicios/tipocliente.service';

import { PaginatePipe } from '../pipe/paginate.pipe'; // Asegúrate que la ruta sea correcta
import { AppResumeService } from 'src/app/Globales/AppResumeService.service';

import { takeUntil } from 'rxjs/operators';
import { LoginService } from '../../login/servicios/login.service';

@Component({
    selector: 'app-clientes',
    templateUrl: './clientes.page.html',
    styleUrls: ['./clientes.page.scss'],
    standalone: true,
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, IonSpinner, IonCheckbox,
        CommonModule, FormsModule, ReactiveFormsModule, PaginatePipe
    ],
    providers: [AlertController, ActionSheetController, ToastController]
})
export class ClientesPage implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();

    isModalOpen = false;
    isEditing = false;
    isDetailModalOpen = false;
    selectedCliente: any = null;
    editingClienteId: number = 0;
    clientForm: FormGroup;
    searchTerm: string = '';
    isLoading: boolean = true;
    private clientesService = inject(ClientesService);
    private ciudadService = inject(CiudadService);
    private tipoClienteService = inject(TipoClienteService);
    private actionSheetController = inject(ActionSheetController);
    private toastController = inject(ToastController); // Inyectar

    ciudades: any[] = [];
    tiposClientes: any[] = [];
    selectedCiudadId: number | null = null;
    selectedFilterTipo: string | null = null;

    // AGREGA ESTAS VARIABLES PARA EL CONTROL
    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public pagesOptions: number[] = [10, 20, 30, 40, 50];
    private loginService = inject(LoginService);

    get totalPages(): number {
        return Math.ceil(this.clientesFiltrados.length / this.itemsPerPage) || 1;
    }

    // Métodos de navegación
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
    prevPage() { if (this.currentPage > 1) this.currentPage--; }
    onItemsPerPageChange() { this.currentPage = 1; }


    ngOnInit() {
        this.cargarClientes();
        this.cargarCiudades();
        this.cargarTipoClientes();

        this.appResumeService.resume$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                console.log('Refrescando clientes...');
                this.cargarClientes(true);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    cargarTipoClientes() {
        this.tipoClienteService.getTipoClientes().subscribe({
            next: (data) => {
                console.log('Tipos de clientes cargados:', data);
                this.tiposClientes = data;
            },
            error: (err) => {
                console.error('Error al cargar tipos de clientes:', err);
            }
        });
    }

    cargarCiudades() {
        this.ciudadService.getCiudades().subscribe({
            next: (data) => {
                console.log('Ciudades cargadas:', data);
                this.ciudades = data;
            },
            error: (err) => {
                console.error('Error al cargar ciudades:', err);
            }
        });
    }

    onCiudadChange(event: any) {
        this.selectedCiudadId = event.target.value;
        console.log('ID de Ciudad seleccionada:', this.selectedCiudadId);
    }

    async abrirFiltros() {
        const botonesFiltro: any[] = this.tiposClientes.map(tipo => ({
            text: tipo.nombreTipo,
            handler: () => {
                this.selectedFilterTipo = tipo.nombreTipo;
            }
        }));

        // Añadir opción para limpiar el filtro (ver todos)
        botonesFiltro.unshift({
            text: 'Todos los clientes',
            handler: () => {
                this.selectedFilterTipo = null;
            }
        });

        // Botón para cancelar/cerrar
        botonesFiltro.push({
            text: 'Cancelar',
            role: 'cancel',
            handler: () => { }
        });

        const actionSheet = await this.actionSheetController.create({
            header: 'Filtrar por Tipo de Cliente',
            buttons: botonesFiltro,
            mode: 'ios'
        });

        await actionSheet.present();
    }

    cargarClientes(esSilencioso: boolean = false) {
        if (!esSilencioso && this.clientes.length === 0) {
            this.isLoading = true;
        }

        this.clientesService.getClientes().subscribe({
            next: (data) => {
                this.clientes = [...data];
                // Guardar en caché para que el próximo F5 sea instantáneo
                localStorage.setItem('cache_clientes', JSON.stringify(this.clientes));
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                console.warn('Error de conexión, manteniendo datos de caché.');
            }
        });
    }

    // Inicialización del arreglo vacío, los datos se llenarán mediante la API
    clientes: any[] = [];

    get clientesFiltrados() {
        let filtrados = this.clientes || [];

        // 1. Aplicar filtro de selección por Tipo de Cliente desde el ActionSheet
        if (this.selectedFilterTipo) {
            filtrados = filtrados.filter(c => c.tipoCliente === this.selectedFilterTipo);
        }

        // 2. Aplicar filtro por texto ingresado en el buscador
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            return filtrados;
        }

        const termino = this.searchTerm.toLowerCase().trim();

        return filtrados.filter(cliente => {
            // Conversión estricta a String en todos los campos (corrige caída en campos como celular)
            const nombreCompleto = String(cliente.nombreCliente || '').toLowerCase();
            const email = String(cliente.email || '').toLowerCase();
            const codigo = String(cliente.codCliente || '').toLowerCase();
            const celular = String(cliente.celular || '').toLowerCase();

            return nombreCompleto.includes(termino) ||
                email.includes(termino) ||
                codigo.includes(termino) ||
                celular.includes(termino);
        });
    }

    constructor(private alertController: AlertController, private appResumeService: AppResumeService) {
        addIcons({ addOutline, searchOutline, filterOutline, informationCircleOutline, pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline, closeOutline, personOutline, mailOutline, callOutline, locationOutline, documentTextOutline, calendarOutline, businessOutline, starOutline });

        this.clientForm = new FormGroup({
            nombreCliente: new FormControl('', [Validators.required]),
            email: new FormControl('', [Validators.required, Validators.email]),
            celular: new FormControl(''),
            direccionCliente: new FormControl(''),
            idCliente: new FormControl(null, [Validators.required]), // Antiguo id_tipo_cliente
            idCiudad: new FormControl(null), // Antiguo id_ciudad
            activo: new FormControl(true),
            observaciones: new FormControl('')
        });
    }

    setOpen(isOpen: boolean, editing: boolean = false, cliente: any = null) {
        this.isModalOpen = isOpen;
        this.isEditing = editing;

        if (isOpen) {
            if (editing && cliente) {
                // Guardamos el ID para el PUT
                this.editingClienteId = cliente.id;
                this.clientForm.patchValue(cliente);
                // Aseguramos que idCiudad se seleccione correctamente
                if (cliente.idCiudad) {
                    this.clientForm.patchValue({ idCiudad: cliente.idCiudad });
                }
                // Aseguramos que idCliente se seleccione correctamente pre-cargando tipo de cliente
                if (cliente.idTipoCliente) {
                    this.clientForm.patchValue({ idCliente: cliente.idTipoCliente });
                }
            } else {
                // Si es nuevo cliente, reseteamos a null o valores por defecto
                this.editingClienteId = 0;
                this.clientForm.reset({
                    idCliente: null,
                    idCiudad: null,
                    activo: true
                });
            }
        }
    }

    onSubmit() {
        if (this.clientForm.invalid) return;

        const formData = this.clientForm.value;

        const payload = {
            id: 0,
            nombreCliente: formData.nombreCliente,
            direccionCliente: formData.direccionCliente,
            email: formData.email,
            celular: Number(formData.celular),
            observaciones: formData.observaciones || '',
            idTipoCliente: Number(formData.idCliente),
            idCiudad: Number(formData.idCiudad),
            idEmpresa: Number(this.clientesService.getIdEmpresaFromToken()),
            activo: formData.activo
        };

        if (this.isEditing) {
            const payloadEdit = { ...payload, id: this.editingClienteId };
            this.clientesService.putCliente(this.editingClienteId, payloadEdit).subscribe({
                next: (res) => {
                    console.log('Cliente actualizado exitosamente:', res);
                    this.setOpen(false);

                    const idx = this.clientes.findIndex(c => c.id === this.editingClienteId);
                    if (idx !== -1) {
                        this.clientes[idx] = { ...this.clientes[idx], ...payloadEdit };
                        this.clientes = [...this.clientes];
                        localStorage.setItem('cache_clientes', JSON.stringify(this.clientes));
                    }

                    // Reemplazado Alert por Snackbar
                    this.notificar('Cliente actualizado correctamente', 'success');
                    this.cargarClientes(true);
                },
                error: (err) => {
                    console.error('Error al actualizar cliente:', err);
                    // Reemplazado Alert por Snackbar
                    this.notificar('Error al actualizar el cliente', 'danger');
                }
            });
        } else {
            this.clientesService.postCliente(payload).subscribe({
                next: (res) => {
                    console.log('Cliente creado exitosamente:', res);
                    this.setOpen(false);
                    this.cargarClientes();

                    // Reemplazado Alert por Snackbar
                    this.notificar('Cliente registrado correctamente', 'success');
                },
                error: (err) => {
                    console.error('Error al crear cliente:', err);
                    // Reemplazado Alert por Snackbar
                    this.notificar('Error al registrar el cliente', 'danger');
                }
            });
        }
    }

    async onDelete(cliente: any) {
        const alert = await this.alertController.create({
            header: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar a <b>${cliente.nombreCliente}</b>?`,
            mode: 'ios',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => {
                        this.isLoading = true;
                        this.clientesService.deleteCliente(cliente.id).subscribe({
                            next: () => {
                                // 1. Actualizar lista local y caché
                                this.clientes = this.clientes.filter(c => c.id !== cliente.id);
                                localStorage.setItem('cache_clientes', JSON.stringify(this.clientes));
                                this.isLoading = false;

                                // 2. Notificación Snackbar (Éxito)
                                this.notificar('Cliente eliminado correctamente', 'success');
                                this.cargarClientes(true);
                            },
                            error: (err) => {
                                console.error('Error al eliminar:', err);
                                this.isLoading = false;

                                // 3. Notificación Snackbar (Error)
                                this.notificar('Error al intentar eliminar el cliente', 'danger');
                            }
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    openDetail(cliente: any) {
        this.selectedCliente = cliente;
        this.isDetailModalOpen = true;
    }

    closeDetail() {
        this.isDetailModalOpen = false;
        this.selectedCliente = null;
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

}
