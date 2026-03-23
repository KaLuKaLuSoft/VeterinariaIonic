import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Dueño {
    id: number;
    codDueños?: string;
    numeroIdentificacion: string;
    nombreCompleto: string;
    celular?: number;
    correoElectronico?: string;
    idCiudad: number;
    nombreCiudad?: string;
    direccion?: string;
    idTipoDocumento: number;
    tipoDocumento?: string;
    idEmpresa: number;
    empresa?: string;
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TutoresService {
    private apiUrl = 'https://localhost:7033/api/Dueños';
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

    getTutores(): Observable<any> {
        const idEmpresa = this.getIdEmpresaFromToken();
        const url = idEmpresa ? `${this.apiUrl}?idEmpresa=${idEmpresa}` : this.apiUrl;
        return this.http.get(url);
    }

    postTutor(tutor: Dueño): Observable<any> {
        return this.http.post(this.apiUrl, tutor, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    putTutor(id: number, tutor: Dueño): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, tutor, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    deleteTutor(id: number): Observable<any> {
        const idEmpresa = this.getIdEmpresaFromToken();
        const url = idEmpresa
            ? `${this.apiUrl}/${id}?idEmpresa=${idEmpresa}`
            : `${this.apiUrl}/${id}`;

        return this.http.delete(url, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
