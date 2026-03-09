import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonInput } from '@ionic/angular';
import { PaisService, Pais } from './services/pais.service';
import { CiudadService, Ciudad } from './services/ciudad.service';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, chevronDownOutline, businessOutline, locationOutline, peopleOutline, ticketOutline, callOutline, mapOutline, caretDownOutline, closeOutline, caretUpOutline, medkitOutline } from 'ionicons/icons';
import { RegistroService } from './services/registro.service';
import { Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { inject, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

const NOMBRE_A_ISO: { [key: string]: string } = {
  'Afganistán': 'af', 'Albania': 'al', 'Alemania': 'de', 'Andorra': 'ad', 'Angola': 'ao',
  'Antigua y Barbuda': 'ag', 'Arabia Saudita': 'sa', 'Argelia': 'dz', 'Argentina': 'ar',
  'Armenia': 'am', 'Australia': 'au', 'Austria': 'at', 'Azerbaiyán': 'az', 'Bahamas': 'bs',
  'Bangladés': 'bd', 'Barbados': 'bb', 'Baréin': 'bh', 'Bélgica': 'be', 'Belice': 'bz',
  'Benín': 'bj', 'Bielorrusia': 'by', 'Bolivia': 'bo', 'Bosnia y Herzegovina': 'ba',
  'Botsuana': 'bw', 'Brasil': 'br', 'Brunéi': 'bn', 'Bulgaria': 'bg', 'Burkina Faso': 'bf',
  'Burundi': 'bi', 'Bután': 'bt', 'Cabo Verde': 'cv', 'Camboya': 'kh', 'Camerún': 'cm',
  'Canadá': 'ca', 'Catar': 'qa', 'Chad': 'td', 'Chile': 'cl', 'China': 'cn', 'Chipre': 'cy',
  'Colombia': 'co', 'Comoras': 'km', 'Corea del Norte': 'kp', 'Corea del Sur': 'kr',
  'Costa de Marfil': 'ci', 'Costa Rica': 'cr', 'Croacia': 'hr', 'Cuba': 'cu', 'Dinamarca': 'dk',
  'Dominica': 'dm', 'Ecuador': 'ec', 'Egipto': 'eg', 'El Salvador': 'sv',
  'Emiratos Árabes Unidos': 'ae', 'Eritrea': 'er', 'Eslovaquia': 'sk', 'Eslovenia': 'si',
  'España': 'es', 'Estados Unidos': 'us', 'Estonia': 'ee', 'Etiopía': 'et', 'Filipinas': 'ph',
  'Finlandia': 'fi', 'Fiyi': 'fj', 'Francia': 'fr', 'Gabón': 'ga', 'Gambia': 'gm',
  'Georgia': 'ge', 'Ghana': 'gh', 'Granada': 'gd', 'Grecia': 'gr', 'Guatemala': 'gt',
  'Guyana': 'gy', 'Guinea': 'gn', 'Guinea Ecuatorial': 'gq', 'Guinea-Bisáu': 'gw',
  'Haití': 'ht', 'Honduras': 'hn', 'Hungría': 'hu', 'India': 'in', 'Indonesia': 'id',
  'Irak': 'iq', 'Irán': 'ir', 'Irlanda': 'ie', 'Islandia': 'is', 'Israel': 'il',
  'Italia': 'it', 'Jamaica': 'jm', 'Japón': 'jp', 'Jordania': 'jo', 'Kazajistán': 'kz',
  'Kenia': 'ke', 'Kirguistán': 'kg', 'Kiribati': 'ki', 'Kuwait': 'kw', 'Laos': 'la',
  'Lesoto': 'ls', 'Letonia': 'lv', 'Líbano': 'lb', 'Liberia': 'lr', 'Libia': 'ly',
  'Liechtenstein': 'li', 'Lituania': 'lt', 'Luxemburgo': 'lu', 'Macedonia del Norte': 'mk',
  'Madagascar': 'mg', 'Malasia': 'my', 'Malaui': 'mw', 'Maldivas': 'mv', 'Malí': 'ml',
  'Malta': 'mt', 'Marruecos': 'ma', 'Mauricio': 'mu', 'Mauritania': 'mr', 'México': 'mx',
  'Micronesia': 'fm', 'Moldavia': 'md', 'Mónaco': 'mc', 'Mongolia': 'mn', 'Montenegro': 'me',
  'Mozambique': 'mz', 'Namibia': 'na', 'Nauru': 'nr', 'Nepal': 'np', 'Nicaragua': 'ni',
  'Níger': 'ne', 'Nigeria': 'ng', 'Noruega': 'no', 'Nueva Zelanda': 'nz', 'Omán': 'om',
  'Países Bajos': 'nl', 'Pakistán': 'pk', 'Palaos': 'pw', 'Panamá': 'pa',
  'Papúa Nueva Guinea': 'pg', 'Paraguay': 'py', 'Perú': 'pe', 'Polonia': 'pl',
  'Portugal': 'pt', 'Reino Unido': 'gb', 'República Dominicana': 'do', 'Rumania': 'ro',
  'Rusia': 'ru', 'Serbia': 'rs', 'Sudáfrica': 'za', 'Suecia': 'se', 'Suiza': 'ch',
  'Tailandia': 'th', 'Turquía': 'tr', 'Ucrania': 'ua', 'Uruguay': 'uy', 'Uzbekistán': 'uz',
  'Venezuela': 've', 'Vietnam': 'vn', 'Zambia': 'zm', 'Zimbabue': 'zw', 'Trinidad y Tobago': 'tt',
  'Santa Lucía': 'lc', 'San Vicente y las Granadinas': 'vc', 'Suriname': 'sr'
};

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  providers: [ToastController]

})

export class RegistroPage implements OnInit {

  @ViewChild('nombreInput') nombreInput?: IonInput;
  @ViewChild('paisSearchInput') paisSearchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('ciudadSearchInput') ciudadSearchInput?: ElementRef<HTMLInputElement>;

  private toastController = inject(ToastController); // Inyectar


  registroForm: FormGroup;
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off-outline';
  currentStep: number = 1;

  // Country picker
  paises: Pais[] = [];
  paisesFiltrados: Pais[] = [];
  paisSeleccionado: Pais | null = null;
  dropdownAbierto: boolean = false;
  searchText: string = '';
  idPaisSeleccionado: number | null = null;

  // Ciudad picker
  ciudades: Ciudad[] = [];
  ciudadesFiltradas: Ciudad[] = [];
  ciudadSeleccionada: Ciudad | null = null;
  dropdownCiudadAbierto: boolean = false;
  searchTextCiudad: string = '';
  idCiudadSeleccionada: number | null = null;

  constructor(
    private fb: FormBuilder,
    private paisService: PaisService,
    private ciudadService: CiudadService,
    private elementRef: ElementRef,
    private registroService: RegistroService,
    private router: Router
  ) {
    addIcons({
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'chevron-down-outline': chevronDownOutline,
      'business-outline': businessOutline,
      'location-outline': locationOutline,
      'people-outline': peopleOutline,
      'call-outline': callOutline,
      'ticket-outline': ticketOutline,
      'map-outline': mapOutline,
      'caret-down-outline': caretDownOutline,
      'close-outline': closeOutline,
      'caret-up-outline': caretUpOutline,
      'medkit-outline': medkitOutline
    });
    this.registroForm = this.fb.group({
      // Step 1 Data
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      pais: ['', [Validators.required]],
      celular: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      referido: [''],
      terminos: [false, [Validators.requiredTrue]],
      // Step 2 Data
      nombreVeterinaria: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      empleados: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.nombreInput?.setFocus();
    }, 400);
  }

  ngOnInit() {
    this.paisService.getPaises().subscribe(paises => {
      this.paises = paises;
      this.paisesFiltrados = [...paises];
    });

    this.registroForm.get('email')?.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        switchMap(email => {

          if (!email || this.registroForm.get('email')?.invalid) {
            return [];
          }

          return this.registroService.verificarEmail(email);
        })
      )
      .subscribe((existe: any) => {

        if (existe === true) {

          this.registroForm.get('email')?.setErrors({ emailExistente: true });

          this.notificar('El correo ya se encuentra registrado', 'danger');
        }

      });

  }

  onCiudadChange(event: any) {
    const idCiudad = event.detail.value;
    console.log('ID de la ciudad seleccionada:', idCiudad);
  }

  toggleDropdownCiudad() {
    this.dropdownCiudadAbierto = !this.dropdownCiudadAbierto;
    if (this.dropdownCiudadAbierto) {
      this.searchTextCiudad = '';
      this.actualizarCiudadesDisponibles();
      setTimeout(() => {
        this.ciudadSearchInput?.nativeElement.focus();
      }, 100);
    }
  }

  actualizarCiudadesDisponibles() {
    const term = this.searchTextCiudad.toLowerCase().trim();
    this.ciudadesFiltradas = this.ciudades.filter(c =>
      c.idPais === this.idPaisSeleccionado &&
      (!term || c.nombreCiudad.toLowerCase().includes(term))
    );
  }

  filtrarCiudades() {
    this.actualizarCiudadesDisponibles();
  }

  seleccionarCiudad(ciudad: Ciudad) {
    this.idCiudadSeleccionada = ciudad.id;
    console.log('ID de la ciudad seleccionada:', this.idCiudadSeleccionada);
    this.ciudadSeleccionada = ciudad;
    this.registroForm.patchValue({ ciudad: ciudad.id });
    this.registroForm.get('ciudad')?.markAsTouched();
    this.dropdownCiudadAbierto = false;
    this.searchTextCiudad = '';
  }
  //Banderas
  getFlagUrl(nombre: string): string {
    const iso = NOMBRE_A_ISO[nombre] || 'un'; // 'un' es la bandera de la ONU si no lo encuentra
    return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const path = event.composedPath();

    const clickedInsideCountry = path.some(el => (el as HTMLElement).classList?.contains('country-picker-wrapper'));
    if (!clickedInsideCountry) {
      this.dropdownAbierto = false;
    }

    const clickedInsideCity = path.some(el => (el as HTMLElement).classList?.contains('city-picker-wrapper'));
    if (!clickedInsideCity) {
      this.dropdownCiudadAbierto = false;
    }
  }

  toggleDropdown() {
    this.dropdownAbierto = !this.dropdownAbierto;
    if (this.dropdownAbierto) {
      this.searchText = '';
      this.paisesFiltrados = [...this.paises];
      setTimeout(() => {
        this.paisSearchInput?.nativeElement.focus();
      }, 100);
    }
  }

  filtrarPaises() {
    const term = this.searchText.toLowerCase().trim();
    if (!term) {
      this.paisesFiltrados = [...this.paises];
    } else {
      this.paisesFiltrados = this.paises.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.codigo.toLowerCase().includes(term)
      );
    }
  }

  seleccionarPais(pais: Pais) {
    this.idPaisSeleccionado = pais.id;
    console.log('ID del país seleccionado:', this.idPaisSeleccionado);

    this.paisSeleccionado = pais;
    this.registroForm.patchValue({ pais: pais.id });
    this.registroForm.get('pais')?.markAsTouched();

    this.dropdownAbierto = false;
    this.searchText = '';

    // limpiar ciudad previa
    this.idCiudadSeleccionada = null;
    this.ciudadSeleccionada = null
    this.registroForm.patchValue({ ciudad: '' });

    // 🔥 Cargar ciudades dinámicamente
    this.ciudadService.getCiudadesPorPais(pais.id).subscribe(ciudades => {
      this.ciudades = ciudades;
      this.ciudadesFiltradas = [...ciudades];
    });
    // Filtramos las ciudades inmediatamente para que el paso 2 ya esté listo
    this.actualizarCiudadesDisponibles();
  }

  togglePassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    this.passwordIcon = this.passwordIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline';
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (this.validateStep1()) {
        this.actualizarCiudadesDisponibles();
        this.currentStep = 2;
      } else {
        this.markStep1Touched();
      }
    } else if (this.currentStep === 2) {
      if (this.validateStep2()) {
        this.onSubmit();
      } else {
        this.markStep2Touched();
      }
    }
  }

  validateStep1(): boolean {
    const fields = ['nombre', 'email', 'password', 'pais', 'celular', 'terminos'];
    return fields.every(field => this.registroForm.get(field)?.valid);
  }

  markStep1Touched() {
    const fields = ['nombre', 'email', 'password', 'pais', 'celular', 'terminos'];
    fields.forEach(field => this.registroForm.get(field)?.markAsTouched());
  }

  validateStep2(): boolean {
    const fields = ['nombreVeterinaria', 'ciudad', 'empleados'];
    return fields.every(field => this.registroForm.get(field)?.valid);
  }

  markStep2Touched() {
    const fields = ['nombreVeterinaria', 'ciudad', 'empleados'];
    fields.forEach(field => this.registroForm.get(field)?.markAsTouched());
  }

  onSubmit() {
    if (this.registroForm.valid) {

      if (!this.idPaisSeleccionado || !this.idCiudadSeleccionada) {
        console.error('Debe seleccionar país y ciudad');
        return;
      }

      const request = {
        NombreComercial: this.registroForm.value.nombreVeterinaria,
        NumeroTrabajadores: this.registroForm.value.empleados,
        IdPais: Number(this.idPaisSeleccionado),
        IdCiudad: Number(this.idCiudadSeleccionada),
        NombreEmpleado: this.registroForm.value.nombre,
        Celular: this.registroForm.value.celular,
        Usuario: this.registroForm.value.email,
        Contrasena: this.registroForm.value.password
      };

      this.registroService.registrar(request).subscribe({
        next: (resp) => {

          if (resp.isSuccess) {

            console.log('Registrado correctamente');
            this.notificar('Registrado correctamente', 'success');
            this.router.navigate(['/login']);

          } else {

            const mensaje = resp.errorMessages?.length
              ? resp.errorMessages[0]
              : resp.displayMessage;

            console.error('Error en registro:', mensaje);
            this.notificar(mensaje, 'danger');
          }

        },
        error: (err) => {
          console.error('Error en la API:', err);
          this.notificar('Error en la API', 'danger');
        }
      });

    } else {
      console.log('Formulario inválido');
    }
  }
  async notificar(mensaje: string, color: 'success' | 'danger') {

    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: color,
      icon: color === 'success' ? 'checkmark-circle' : 'alert-circle',
      cssClass: 'custom-toast-right'
    });

    await toast.present();
  }
}
