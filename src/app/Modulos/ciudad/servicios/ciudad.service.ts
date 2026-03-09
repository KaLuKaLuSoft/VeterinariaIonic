import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

interface ApiResponse<T> {
    isSuccess: boolean;
    result: T;
    displayMessage: string;
    errorMessages: string[] | null;
}

@Injectable({
    providedIn: 'root'
})
export class CiudadService {
    private apiUrl = 'https://localhost:7033/api/Ciudad';
    private http = inject(HttpClient);

    constructor() { }

    /**
   * Obtiene el idPais decodificando el token almacenado en sessionStorage.
   * El token es un JWT con formato header.payload.signature.
   */
    getIdPaisFromToken(): string | null {
        const token = sessionStorage.getItem('token');
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedToken = JSON.parse(jsonPayload);
            console.log('Token decodificado completo:', decodedToken);
            // Según el JSON del usuario, la clave es "IdPais" con I mayúscula
            return decodedToken.IdPais || decodedToken.idPais || null;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    }

    /**
     * Obtiene el idPais almacenado en sessionStorage.
     */
    getIdPais(): string | null {
        return sessionStorage.getItem('idPais');
    }

    /**
   * Obtiene la lista de ciudades, priorizando el idPais del token sobre sessionStorage.
   */
    getCiudades(): Observable<any> {
        const idPaisToken = this.getIdPaisFromToken();
        const idPaisSession = sessionStorage.getItem('idPais');

        console.log('idPais del Token:', idPaisToken);
        console.log('idPais del SessionStorage:', idPaisSession);

        const idPais = idPaisToken || idPaisSession;
        console.log('idPais FINAL utilizado:', idPais);

        const url = idPais ? `${this.apiUrl}?idPais=${idPais}` : this.apiUrl;
        console.log('URL final de Ciudades:', url);

        return this.http.get<ApiResponse<any>>(url).pipe(
            map(response => response.result ?? []),
            catchError(error => {
                console.error('Error al obtener ciudades:', error);
                return of([]);
            })
        );
    }

    /**
     * Obtiene las ciudades filtradas por un ID de país específico.
     */
    getCiudadesByPais(idPais: number): Observable<any> {
        return this.http.get(`${this.apiUrl}?idPais=${idPais}`);
    }
}
