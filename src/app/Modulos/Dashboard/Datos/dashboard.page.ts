import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
    standalone: true,
    imports: [CommonModule, IonContent],
})
export class DashboardPage {
    stats = {
        appointments: 5,
        newPatients: 12,
        revenue: 15450
    };

    appointments = [
        { patient: 'Firulais', time: '10:00 AM', motive: 'Consulta General', doctor: 'Dr. Perez' },
        { patient: 'Mittens', time: '10:30 AM', motive: 'Vacunación', doctor: 'Dr. Rodriguez' },
        { patient: 'Buddy', time: '11:15 AM', motive: 'Control', doctor: 'Dr. Gonzalez' },
        { patient: 'Cojera', time: '12:00 PM', motive: 'Cirugía', doctor: 'Dr. Gonzalez' },
    ];
}
