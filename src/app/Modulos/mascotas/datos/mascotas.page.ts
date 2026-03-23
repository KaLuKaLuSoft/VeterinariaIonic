import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, AlertController, IonSpinner, ActionSheetController, IonCheckbox, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, searchOutline, closeOutline, personOutline, mailOutline, callOutline, locationOutline, businessOutline, documentTextOutline, filterOutline, calendarOutline, starOutline, informationCircleOutline, pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline, pawOutline, maleFemaleOutline, closeCircleOutline, caretUpOutline, caretDownOutline } from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MascotasService, Mascota } from '../servicios/mascotas.service';
import { TutoresService } from '../../tutores/servicios/tutores.service';
import { PaginatePipe } from '../pipe/paginate.pipe';
import { AppResumeService } from 'src/app/Globales/AppResumeService.service';

@Component({
    selector: 'app-mascotas',
    templateUrl: './mascotas.page.html',
    styleUrls: ['./mascotas.page.scss'],
    standalone: true,
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, IonSpinner, IonCheckbox,
        CommonModule, FormsModule, ReactiveFormsModule, PaginatePipe
    ],
    providers: [AlertController, ActionSheetController, ToastController]
})
export class MascotasPage implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private mascotasService = inject(MascotasService);
    private tutoresService = inject(TutoresService);
    private alertController = inject(AlertController);
    private actionSheetController = inject(ActionSheetController);
    private toastController = inject(ToastController);
    private appResumeService = inject(AppResumeService);
    private router = inject(Router);

    mascotas: any[] = [];
    clientes: any[] = [];
    isLoading: boolean = true;
    searchTerm: string = '';

    isModalOpen = false;
    isEditing = false;
    editingMascotaId: number = 0;
    mascotaForm: FormGroup;

    isDetailModalOpen = false;
    selectedMascota: any = null;

    public currentPage: number = 1;
    public itemsPerPage: number = 10;
    public pagesOptions: number[] = [10, 20, 30, 40, 50];

    get totalPages(): number {
        return Math.ceil(this.mascotasFiltrados.length / this.itemsPerPage) || 1;
    }

    get mascotasFiltrados() {
        let filtrados = this.mascotas || [];
        if (!this.searchTerm || this.searchTerm.trim() === '') {
            return filtrados;
        }
        const termino = this.searchTerm.toLowerCase().trim();
        return filtrados.filter(m => {
            const nombre = String(m.nombreMascota || '').toLowerCase();
            const especie = String(m.especie || '').toLowerCase();
            const raza = String(m.raza || '').toLowerCase();
            const cliente = String(m.nombreCliente || '').toLowerCase();
            return nombre.includes(termino) || especie.includes(termino) || raza.includes(termino) || cliente.includes(termino);
        });
    }

    constructor() {
        addIcons({ addOutline, searchOutline, informationCircleOutline, pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline, closeCircleOutline, caretDownOutline, caretUpOutline, closeOutline, pawOutline, maleFemaleOutline, calendarOutline, personOutline, documentTextOutline, businessOutline, starOutline, filterOutline, mailOutline, callOutline, locationOutline });

        this.mascotaForm = new FormGroup({
            nombreMascota: new FormControl('', [Validators.required]),
            especie: new FormControl('', [Validators.required]),
            raza: new FormControl(''),
            sexo: new FormControl('M', [Validators.required]),
            fechaNacimiento: new FormControl(''),
            idCliente: new FormControl(null, [Validators.required]),
            activo: new FormControl(true),
            observaciones: new FormControl('')
        });
    }

    ngOnInit() {
        this.cargarMascotas();
        this.cargarTutores();

        this.appResumeService.resume$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.cargarMascotas(true);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarMascotas(esSilencioso: boolean = false) {
        if (!esSilencioso) this.isLoading = true;
        this.mascotasService.getMascotas().subscribe({
            next: (data) => {
                this.mascotas = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al cargar mascotas:', err);
                this.isLoading = false;
            }
        });
    }

    cargarTutores() {
        this.tutoresService.getTutores().subscribe({
            next: (data) => {
                let lista = [];
                if (Array.isArray(data)) {
                    lista = data;
                } else if (data && Array.isArray(data.result)) {
                    lista = data.result;
                }
                this.clientes = lista.map((t: any) => ({
                    ...t,
                    id: t.id || t.Id,
                    nombreCliente: t.nombreCompleto || t.NombreCompleto,
                    numeroIdentificacion: t.numeroIdentificacion || t.NumeroIdentificacion,
                    codCliente: t.codDueños || t.codDuenos || t.CodDueños
                }));
            },
            error: (err) => console.error('Error al cargar tutores:', err)
        });
    }

    setOpen(isOpen: boolean, editing: boolean = false, mascota: any = null) {
        this.isModalOpen = isOpen;
        this.isEditing = editing;
        if (isOpen) {
            if (editing && mascota) {
                this.editingMascotaId = mascota.id;
                this.mascotaForm.patchValue(mascota);
            } else {
                this.editingMascotaId = 0;
                this.mascotaForm.reset({
                    sexo: 'M',
                    activo: true,
                    idCliente: null
                });
            }
        }
    }

    onSubmit() {
        if (this.mascotaForm.invalid) return;
        const formData = this.mascotaForm.value;
        const payload: Mascota = {
            id: this.editingMascotaId,
            nombreMascota: formData.nombreMascota,
            especie: formData.especie,
            raza: formData.raza || '',
            sexo: formData.sexo,
            fechaNacimiento: formData.fechaNacimiento,
            idCliente: Number(formData.idCliente),
            idEmpresa: Number(this.mascotasService.getIdEmpresaFromToken()),
            activo: formData.activo,
            observaciones: formData.observaciones || ''
        };

        if (this.isEditing) {
            this.mascotasService.putMascota(this.editingMascotaId, payload).subscribe({
                next: () => {
                    this.notificar('Mascota actualizada correctamente', 'success');
                    this.setOpen(false);
                    this.cargarMascotas(true);
                },
                error: () => this.notificar('Error al actualizar mascota', 'danger')
            });
        } else {
            this.mascotasService.postMascota(payload).subscribe({
                next: () => {
                    this.notificar('Mascota registrada correctamente', 'success');
                    this.setOpen(false);
                    this.cargarMascotas();
                },
                error: () => this.notificar('Error al registrar mascota', 'danger')
            });
        }
    }

    async onDelete(mascota: any) {
        const alert = await this.alertController.create({
            header: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar a <b>${mascota.nombreMascota}</b>?`,
            mode: 'ios',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => {
                        this.mascotasService.deleteMascota(mascota.id).subscribe({
                            next: () => {
                                this.notificar('Mascota eliminada correctamente', 'success');
                                this.cargarMascotas(true);
                            },
                            error: () => this.notificar('Error al eliminar mascota', 'danger')
                        });
                    }
                }
            ]
        });
        await alert.present();
    }

    openDetail(mascota: any) {
        this.selectedMascota = mascota;
        this.isDetailModalOpen = true;
    }

    closeDetail() {
        this.isDetailModalOpen = false;
        this.selectedMascota = null;
    }

    async notificar(mensaje: string, color: 'success' | 'danger') {
        const toast = await this.toastController.create({
            message: mensaje,
            duration: 2500,
            position: 'bottom',
            color: color,
            mode: 'ios'
        });
        await toast.present();
    }

    // ── Owner Selection Modal ──
    isOwnerModalOpen = false;
    isOwnerListVisible = false;
    ownerSearchTerm = '';
    selectedOwnerIndex = -1;

    showOwnerModal() {
        this.ownerSearchTerm = '';
        this.isOwnerListVisible = false;
        this.selectedOwnerIndex = -1;
        this.isOwnerModalOpen = true;
    }

    closeOwnerModal() {
        this.isOwnerModalOpen = false;
        this.isOwnerListVisible = false;
        this.ownerSearchTerm = '';
        this.selectedOwnerIndex = -1;
    }

    toggleOwnerList() {
        this.isOwnerListVisible = !this.isOwnerListVisible;
        this.selectedOwnerIndex = -1;
        if (this.isOwnerListVisible) {
            // Foco automático inmediato
            setTimeout(() => {
                const input = document.querySelector('.owner-input-wrapper input') as HTMLInputElement;
                if (input) input.focus();
            }, 50);
        }
    }

    get filteredClientes() {
        const term = (this.ownerSearchTerm || '').toLowerCase().trim();
        if (!term) {
            return [];
        }
        return this.clientes.filter(c =>
            (c.nombreCliente || '').toLowerCase().includes(term) ||
            (c.numeroIdentificacion || '').toLowerCase().includes(term) ||
            String(c.codCliente || '').toLowerCase().includes(term)
        );
    }

    onSelectOwner(cliente: any) {
        if (!cliente || !cliente.id) return;

        this.isOwnerModalOpen = false;
        this.isOwnerListVisible = false;

        setTimeout(() => {
            this.router.navigate(['/home/propietario', cliente.id], {
                queryParams: { openSpeciesSelection: 'true' }
            });
            this.ownerSearchTerm = '';
        }, 150);
    }

    handleOwnerKeyDown(event: KeyboardEvent) {
        const results = this.filteredClientes;
        if (results.length === 0) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            this.selectedOwnerIndex = (this.selectedOwnerIndex + 1) % results.length;
            this.scrollToSelected();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            this.selectedOwnerIndex = (this.selectedOwnerIndex - 1 + results.length) % results.length;
            this.scrollToSelected();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (this.selectedOwnerIndex >= 0) {
                this.onSelectOwner(results[this.selectedOwnerIndex]);
            } else {
                this.onSelectOwner(results[0]);
            }
        } else if (event.key === 'Escape') {
            this.closeOwnerModal();
        }
    }

    private scrollToSelected() {
        setTimeout(() => {
            const selectedItem = document.querySelector('.owner-item.selected');
            if (selectedItem) {
                selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }, 10);
    }

    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }
    prevPage() { if (this.currentPage > 1) this.currentPage--; }
}
