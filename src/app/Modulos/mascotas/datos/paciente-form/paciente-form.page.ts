import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
    IonContent, IonSpinner, ToastController, IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, pawOutline, saveOutline, personOutline, calendarOutline, documentTextOutline, closeOutline } from 'ionicons/icons';

import { MascotasService, Mascota } from '../../servicios/mascotas.service';
import { TutoresService } from '../../../tutores/servicios/tutores.service';
import { RazaMascotaService, RazaMascota } from '../../servicios/razamascota.service';

@Component({
    selector: 'app-paciente-form',
    templateUrl: './paciente-form.page.html',
    styleUrls: ['./paciente-form.page.scss'],
    standalone: true,
    imports: [
        IonContent, IonSpinner, IonIcon,
        CommonModule, FormsModule, ReactiveFormsModule
    ]
})
export class NuevoPacientePage implements OnInit {

    tutorId: number = 0;
    especieId: number = 0;
    tutor: any = null;
    isLoading: boolean = true;
    currentStep: number = 1;

    // Form Groups
    pacienteForm: FormGroup;
    complementariosForm: FormGroup;
    antecedentesForm: FormGroup;

    // Listas de razas
    razas: RazaMascota[] = [];
    todasRazas: RazaMascota[] = [];

    // Searchable Raza Dropdown
    razaSearch: string = '';
    razaDropdownOpen: boolean = false;
    get razasFiltradas(): RazaMascota[] {
        if (!this.razaSearch.trim()) return this.razas;
        const q = this.razaSearch.toLowerCase();
        return this.razas.filter(r => r.nombreRaza?.toLowerCase().includes(q));
    }
    get razaSeleccionadaNombre(): string {
        return this.pacienteForm.get('raza')?.value || '';
    }

    // Listas dummy para selects
    colores: string[] = ['Blanco', 'Negro', 'Café', 'Gris', 'Manchado', 'Atigrado'];
    tallas: string[] = ['Pequeño', 'Mediano', 'Grande', 'Gigante'];
    
    // Listas para Step 2
    especiesLista: string[] = ['Canino', 'Felino', 'Equino', 'Bovino', 'Porcino', 'Otro'];
    animalesConvivencia: any[] = [];

    // Listas para Step 3 (Antecedentes)
    vacunasList: any[] = [];
    desparasitacionesList: any[] = [];
    enfermedadesList: any[] = [];
    cirugiasList: any[] = [];

    // Opciones dummy para selects del Step 3
    opcionesVacunas: string[] = ['Rabia', 'Parvovirus', 'Moquillo', 'Triple Felina', 'Leptospirosis'];
    opcionesMedicamentos: string[] = ['Albendazol', 'Praziquantel', 'Ivermectina', 'Pyrantel'];
    opcionesEnfermedades: string[] = ['Gastritis', 'Otitis', 'Dermatitis', 'Conjuntivitis', 'Insuficiencia Renal'];

    public route = inject(ActivatedRoute);
    public router = inject(Router);
    private mascotasService = inject(MascotasService);
    private tutoresService = inject(TutoresService);
    private toastController = inject(ToastController);
    private razaMascotaService = inject(RazaMascotaService);

    constructor() {
        addIcons({ arrowBackOutline, pawOutline, saveOutline, personOutline, calendarOutline, documentTextOutline, closeOutline });

        this.pacienteForm = new FormGroup({
            nombreMascota: new FormControl('', [Validators.required]),
            raza: new FormControl('', [Validators.required]),
            sexo: new FormControl('M', [Validators.required]),
            color: new FormControl(''),
            idChip: new FormControl(''),
            fechaNacimiento: new FormControl('', [Validators.required]),
            talla: new FormControl(''),
            pesoInicial: new FormControl(''),
            senalesParticulares: new FormControl('')
        });

        this.complementariosForm = new FormGroup({
            tipoAlimentacion: new FormControl('Casera', [Validators.required]),
            alimentacionCual: new FormControl(''),
            frecuenciaConsumo: new FormControl('1 Vez', [Validators.required]),
            saleALaCalle: new FormControl('No', [Validators.required]),
            procedencia: new FormControl('Urbana', [Validators.required]),
            habitat: new FormControl('Casa', [Validators.required]),
            habitatCual: new FormControl(''),
            conviveOtros: new FormControl('No', [Validators.required]),
            // Campos temporales para añadir animales
            tempEspecie: new FormControl(''),
            tempRaza: new FormControl(''),
            tempNombre: new FormControl(''),
            estadoReproductivo: new FormControl('Entero', [Validators.required])
        });

        this.antecedentesForm = new FormGroup({
            // Alergias
            conoceAlergias: new FormControl(false),
            alergiasDetalle: new FormControl(''),
            
            // Vacunas
            conoceVacunas: new FormControl(false),
            tempVacuna: new FormControl(''),
            tempFechaVacuna: new FormControl(''),

            // Desparasitación
            conoceDesparasitacion: new FormControl(false),
            tempMedicamento: new FormControl(''),
            tempFechaDesparasitacion: new FormControl(''),

            // Enfermedades
            conoceEnfermedades: new FormControl(false),
            tempEnfermedad: new FormControl(''),
            tempMedEnfermedad: new FormControl(''),
            tempFechaEnfermedad: new FormControl(''),
            tempEvolucion: new FormControl(''),

            // Cirugías
            conoceCirugias: new FormControl(false),
            tempCirugia: new FormControl(''),
            tempFechaCirugia: new FormControl('')
        });
    }

    ngOnInit() {
        this.tutorId = Number(this.route.snapshot.paramMap.get('idTutor'));
        this.especieId = Number(this.route.snapshot.paramMap.get('idEspecie'));
        this.cargarTutor();
        this.cargarRazas();
    }

    cargarRazas() {
        this.razaMascotaService.getRazaMascotas().subscribe({
            next: (data) => {
                let list = [];
                // Handle different response structures if necessary
                if (Array.isArray(data)) list = data;
                else if ((data as any).result && Array.isArray((data as any).result)) list = (data as any).result;
                
                this.todasRazas = list;
                this.filtrarRazasPorEspecie();
            },
            error: (err) => {
                console.error('Error loading razas', err);
            }
        });
    }

    filtrarRazasPorEspecie() {
        if (this.especieId && this.especieId > 0) {
            this.razas = this.todasRazas.filter(r => r.idEspecieMascota === this.especieId);
        } else {
            this.razas = this.todasRazas;
        }
    }

    toggleRazaDropdown() {
        this.razaDropdownOpen = !this.razaDropdownOpen;
        if (this.razaDropdownOpen) {
            this.razaSearch = '';
        }
    }

    selectRaza(raza: RazaMascota) {
        this.pacienteForm.patchValue({ raza: raza.nombreRaza });
        this.razaDropdownOpen = false;
        this.razaSearch = '';
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.raza-dropdown-wrapper')) {
            this.razaDropdownOpen = false;
        }
    }

    cargarTutor() {
        this.tutoresService.getTutores().subscribe({
            next: (data: any) => {
                let lista = [];
                if (Array.isArray(data)) lista = data;
                else if (data && Array.isArray(data.result)) lista = data.result;

                this.tutor = lista.find((t: any) => t.id === this.tutorId) || null;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    onSubmit() {
        if (this.pacienteForm.invalid) return;

        const formData = this.pacienteForm.value;
        const payload: Mascota = {
            id: 0,
            nombreMascota: formData.nombreMascota,
            especie: this.getEspecieNombre(this.especieId),
            raza: formData.raza || '',
            sexo: formData.sexo,
            fechaNacimiento: formData.fechaNacimiento,
            idCliente: this.tutorId,
            idEmpresa: Number(this.mascotasService.getIdEmpresaFromToken()),
            activo: true,
            observaciones: formData.senalesParticulares || ''
        };

        // Note: New fields (idChip, etc.) may need backend interface updates. 
        // For now, mapping senalesParticulares to observaciones.

        this.mascotasService.postMascota(payload).subscribe({
            next: () => {
                this.notificar('Paciente registrado satisfactoriamente', 'success');
                this.router.navigate(['/home/propietario', this.tutorId]);
            },
            error: () => this.notificar('Error al registrar el paciente', 'danger')
        });
    }

    getEspecieNombre(id: number): string {
        const especies: any = {
            1: 'Canino',
            2: 'Felino',
            3: 'Equino',
            4: 'Bovino',
            5: 'Porcino',
            6: 'Otros'
        };
        return especies[id] || 'Otros';
    }

    changeStep(step: number) {
        if (step < 1 || step > 3) return;
        this.currentStep = step;
    }

    addAnimalConvivencia() {
        const especie = this.complementariosForm.get('tempEspecie')?.value;
        const raza = this.complementariosForm.get('tempRaza')?.value;
        const nombre = this.complementariosForm.get('tempNombre')?.value;

        if (especie || raza || nombre) {
            this.animalesConvivencia.push({ especie, raza, nombre });
            this.complementariosForm.patchValue({
                tempEspecie: '',
                tempRaza: '',
                tempNombre: ''
            });
        }
    }

    removeAnimalConvivencia(index: number) {
        this.animalesConvivencia.splice(index, 1);
    }

    // Methods for Step 3
    addVacuna() {
        const v = this.antecedentesForm.get('tempVacuna')?.value;
        const f = this.antecedentesForm.get('tempFechaVacuna')?.value;
        if (v && f) {
            this.vacunasList.push({ nombre: v, fecha: f });
            this.antecedentesForm.patchValue({ tempVacuna: '', tempFechaVacuna: '' });
        }
    }
    removeVacuna(i: number) { this.vacunasList.splice(i, 1); }

    addDesparasitacion() {
        const m = this.antecedentesForm.get('tempMedicamento')?.value;
        const f = this.antecedentesForm.get('tempFechaDesparasitacion')?.value;
        if (m && f) {
            this.desparasitacionesList.push({ medicamento: m, fecha: f });
            this.antecedentesForm.patchValue({ tempMedicamento: '', tempFechaDesparasitacion: '' });
        }
    }
    removeDesparasitacion(i: number) { this.desparasitacionesList.splice(i, 1); }

    addEnfermedad() {
        const e = this.antecedentesForm.get('tempEnfermedad')?.value;
        const m = this.antecedentesForm.get('tempMedEnfermedad')?.value;
        const f = this.antecedentesForm.get('tempFechaEnfermedad')?.value;
        const ev = this.antecedentesForm.get('tempEvolucion')?.value;
        if (e && f) {
            this.enfermedadesList.push({ enfermedad: e, medicamentos: m, fecha: f, evolucion: ev });
            this.antecedentesForm.patchValue({ tempEnfermedad: '', tempMedEnfermedad: '', tempFechaEnfermedad: '', tempEvolucion: '' });
        }
    }
    removeEnfermedad(i: number) { this.enfermedadesList.splice(i, 1); }

    addCirugia() {
        const c = this.antecedentesForm.get('tempCirugia')?.value;
        const f = this.antecedentesForm.get('tempFechaCirugia')?.value;
        if (c && f) {
            this.cirugiasList.push({ procedimiento: c, fecha: f });
            this.antecedentesForm.patchValue({ tempCirugia: '', tempFechaCirugia: '' });
        }
    }
    removeCirugia(i: number) { this.cirugiasList.splice(i, 1); }

    goBack() {
        if (this.currentStep > 1) {
            this.currentStep--;
        } else {
            this.router.navigate(['/home/propietario', this.tutorId]);
        }
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
}
