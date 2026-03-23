import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EspecieMascotasService {
    private apiUrl = 'https://localhost:7033/api/EspecieMascotas';
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

    getEspecieMascotas(): Observable<any> {
        return this.http.get(this.apiUrl);
    }
}
