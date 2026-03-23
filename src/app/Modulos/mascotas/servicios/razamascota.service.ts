import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RazaMascota {
    id: number;
    nombreRaza: string;
    idEspecieMascota: number;
    especieMascota?: string;
    fecha_Alta?: Date;
    fecha_Modificacion?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class RazaMascotaService {
    private apiUrl = 'https://localhost:7033/api/RazaMascotas';
    private http = inject(HttpClient);

    constructor() { }

    getRazaMascotas(): Observable<RazaMascota[]> {
        return this.http.get<RazaMascota[]>(this.apiUrl);
    }

    getRazaMascotaById(id: number): Observable<RazaMascota> {
        return this.http.get<RazaMascota>(`${this.apiUrl}/${id}`);
    }
}
