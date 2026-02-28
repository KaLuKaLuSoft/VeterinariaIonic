import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Ciudad {
    id: number;
    nombreCiudad: string;
    idPais: number;
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CiudadService {

    private apiUrl = 'https://localhost:7033/api/Ciudad';

    constructor(private http: HttpClient) { }

    getCiudades(): Observable<Ciudad[]> {
        return this.http.get<Ciudad[]>(this.apiUrl).pipe(
            catchError(() => of([]))
        );
    }
}
