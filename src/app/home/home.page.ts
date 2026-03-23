import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { LoginService } from '../modulos/login/servicios/login.service';
import { addIcons } from 'ionicons';
import { homeOutline, peopleOutline, calendarOutline, clipboardOutline, cubeOutline, personOutline, settingsOutline, logOutOutline, searchOutline, paw, menuOutline, medkitOutline, receiptOutline, cartOutline, busOutline, cashOutline, businessOutline, chatbubbleOutline, documentTextOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon, IonRouterOutlet],
})
export class HomePage implements OnInit {
  private loginService = inject(LoginService);
  private router = inject(Router);

  userName = '';
  isMobileMenuOpen = false;

  menuItems = [
    { label: 'Dashboard', icon: 'home-outline', active: true, path: '/home' },
    { label: 'Clientes', icon: 'people-outline', active: false, path: '/home/clientes' },
    { label: 'Tutores', icon: 'person-outline', active: false, path: '/home/tutores' },
    { label: 'Pacientes', icon: 'paw', active: false, path: '/home/mascotas' },
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

  ngOnInit() {
    this.userName = 'Dr. ' + (sessionStorage.getItem('empleado') || 'Usuario');
    this.updateActiveItem();

    // Subscribe to router events to keep the menu in sync
    this.router.events.subscribe(() => {
      this.updateActiveItem();
    });
  }

  updateActiveItem() {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      // Check if the current URL matches the item path or starts with it (for child routes)
      // Special case for dashboard ('/home') to avoid matching everything starting with '/home'
      if (item.path === '/home') {
        item.active = currentUrl === '/home' || currentUrl === '/home/dashboard';
      } else {
        item.active = currentUrl.startsWith(item.path);
      }
    });
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
