import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { LoginService } from '../Modulos/login/Servicios/login.service';
import { addIcons } from 'ionicons';
import { homeOutline, peopleOutline, calendarOutline, clipboardOutline, cubeOutline, personOutline, settingsOutline, logOutOutline, searchOutline, paw, menuOutline, medkitOutline, receiptOutline, cartOutline, busOutline, cashOutline, businessOutline, chatbubbleOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonRouterOutlet],
})
export class HomePage {
  private loginService = inject(LoginService);
  private router = inject(Router);

  userName = 'Dr. Ana Perez';
  isMobileMenuOpen = false;

  menuItems = [
    { label: 'Dashboard', icon: 'home-outline', active: true, path: '/home' },
    { label: 'Clientes', icon: 'people-outline', active: false, path: '/home/clientes' },
    { label: 'Pacientes', icon: 'paw', active: false, path: '/home/pacientes' },
    { label: 'Agenda y Citas', icon: 'calendar-outline', active: false, path: '/home/agenda' },
    { label: 'Hospital y Cirugía', icon: 'medkit-outline', active: false, path: '/home/hospital' },
    { label: 'Inventario', icon: 'cube-outline', active: false, path: '/home/inventario' },
    { label: 'Ventas y Facturación', icon: 'receipt-outline', active: false, path: '/home/ventas' },
    { label: 'Compras', icon: 'cart-outline', active: false, path: '/home/compras' },
    { label: 'Logística', icon: 'bus-outline', active: false, path: '/home/logistica' },
    { label: 'Finanzas y Cajas', icon: 'cash-outline', active: false, path: '/home/finanzas' },
    { label: 'Recursos Humanos y Activos', icon: 'business-outline', active: false, path: '/home/recursos-humanos' },
    { label: 'Comunicación', icon: 'chatbubble-outline', active: false, path: '/home/comunicacion' },
    { label: 'Auditoria', icon: 'document-text-outline', active: false, path: '/home/auditoria' },
    { label: 'Configuración del Sistema', icon: 'settings-outline', active: false, path: '/home/configuracion' },
  ];

  constructor() {
    addIcons({ homeOutline, peopleOutline, calendarOutline, clipboardOutline, cubeOutline, personOutline, settingsOutline, logOutOutline, searchOutline, paw, menuOutline, medkitOutline, receiptOutline, cartOutline, busOutline, cashOutline, businessOutline, chatbubbleOutline, documentTextOutline });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateTo(item: any) {
    this.menuItems.forEach(mi => mi.active = false);
    item.active = true;
    if (item.path) {
      this.router.navigate([item.path]);
    }
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  logout() {
    this.loginService.logout();
  }
}
