import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, searchOutline, closeOutline, personOutline, mailOutline, callOutline, locationOutline, businessOutline, documentTextOutline, filterOutline, calendarOutline, starOutline, informationCircleOutline, pencilOutline, trashOutline } from 'ionicons/icons';

@Component({
    selector: 'app-clientes',
    templateUrl: './clientes.page.html',
    styleUrls: ['./clientes.page.scss'],
    standalone: true,
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonModal,
        CommonModule, FormsModule, ReactiveFormsModule
    ],
    providers: [AlertController]
})
export class ClientesPage {
    isModalOpen = false;
    isEditing = false;
    isDetailModalOpen = false;
    selectedCliente: any = null;
    clientForm: FormGroup;
    searchTerm: string = '';

    // Mock data based on SQL schema
    clientes = [
        {
            id_cliente: 1,
            codigo_cliente: 'CLI-001',
            nombre: 'Juan',
            apellido: 'Perez',
            direccion: 'Calle Falsa 123',
            telefono_principal: '555-0101',
            email: 'juan@example.com',
            tipo_cliente: 'Regular'
        },
        {
            id_cliente: 2,
            codigo_cliente: 'CLI-002',
            nombre: 'Maria',
            apellido: 'Garcia',
            direccion: 'Avenida Siempre Viva 742',
            telefono_principal: '555-0102',
            email: 'maria@example.com',
            tipo_cliente: 'VIP'
        }
    ];

    constructor(private alertController: AlertController) {
        addIcons({
            addOutline, searchOutline, closeOutline, personOutline, mailOutline,
            callOutline, locationOutline, businessOutline, documentTextOutline,
            filterOutline, calendarOutline, starOutline, informationCircleOutline,
            pencilOutline, trashOutline
        });

        this.clientForm = new FormGroup({
            codigo_cliente: new FormControl(''), // Often generated or manual
            nombre: new FormControl('', [Validators.required]),
            apellido: new FormControl('', [Validators.required]),
            direccion: new FormControl(''),
            id_ciudad: new FormControl(null),
            telefono_principal: new FormControl(''),
            telefono_secundario: new FormControl(''),
            email: new FormControl('', [Validators.required, Validators.email]),
            id_tipo_cliente: new FormControl(1, [Validators.required]),
            observaciones: new FormControl('')
        });
    }

    setOpen(isOpen: boolean, editing: boolean = false, cliente: any = null) {
        this.isModalOpen = isOpen;
        this.isEditing = editing;

        if (isOpen && editing && cliente) {
            this.clientForm.patchValue(cliente);
        } else if (!isOpen) {
            this.clientForm.reset({ id_tipo_cliente: 1 });
        }
    }

    onSubmit() {
        if (this.clientForm.valid) {
            if (this.isEditing) {
                console.log('Updating Client:', this.clientForm.value);
                // Implementation for update would go here
            } else {
                console.log('Creating Client:', this.clientForm.value);
                // Implementation for create would go here
            }
            this.setOpen(false);
        }
    }

    async onDelete(cliente: any) {
        const alert = await this.alertController.create({
            header: 'Confirmar Eliminación',
            message: `¿Estás seguro de que deseas eliminar al cliente ${cliente.nombre} ${cliente.apellido}? Esta acción no se puede deshacer.`,
            mode: 'ios',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel',
                    cssClass: 'secondary'
                },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => {
                        console.log('Deleting Client:', cliente.id_cliente);
                        // Implementation for delete would go here
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
}
