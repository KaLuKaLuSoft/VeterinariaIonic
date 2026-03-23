import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mascota {
    id: number;
    nombreMascota: string;
    especie: string;
    raza: string;
    sexo: string;
    fechaNacimiento: string;
    idCliente: number;
    idEmpresa: number;
    activo: boolean;
    observaciones?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MascotasService {
    private apiUrl = 'https://localhost:7033/api/Mascotas';
    private http = inject(HttpClient);

    constructor() { }

    getIdEmpresaFromToken(): string | null {
        const token = sessionStorage.getItem('token');
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedToken = JSON.parse(jsonPayload);
            return decodedToken.IdEmpresa || decodedToken.idEmpresa || null;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    }

    getMascotas(): Observable<any> {
        const idEmpresa = this.getIdEmpresaFromToken();
        const url = idEmpresa ? `${this.apiUrl}?idEmpresa=${idEmpresa}` : this.apiUrl;
        return this.http.get(url);
    }

    postMascota(mascota: Mascota): Observable<any> {
        return this.http.post(this.apiUrl, mascota, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    putMascota(id: number, mascota: Mascota): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, mascota, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    deleteMascota(id: number): Observable<any> {
        const idEmpresa = this.getIdEmpresaFromToken();
        const url = idEmpresa
            ? `${this.apiUrl}/${id}?idEmpresa=${idEmpresa}`
            : `${this.apiUrl}/${id}`;

        return this.http.delete(url, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
