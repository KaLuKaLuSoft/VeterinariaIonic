import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';

export interface Ciudad {
    id: number;
    nombreCiudad: string;
    idPais: number;
    activo: boolean;
    nombrePaises?: string;
    fecha_Alta?: string;
    fecha_Modificacion?: string | null;
}

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

    constructor(private http: HttpClient) { }

    getCiudadesPorPais(idPais: number): Observable<Ciudad[]> {
        return this.http
            .get<ApiResponse<Ciudad[]>>(`${this.apiUrl}?idPais=${idPais}`)
            .pipe(
                map(response => response.result ?? []),
                catchError(() => of([]))
            );
    }
}
