import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

interface ApiResponse<T> {
    isSuccess: boolean;
    result: T;
}

@Injectable({
    providedIn: 'root'
})
export class TipoClienteService {
    private apiUrl = 'https://localhost:7033/api/TipoClientes';
    private http = inject(HttpClient);

    constructor() { }

    /**
     * Obtiene la lista de tipos de clientes.
     */
    getTipoClientes(): Observable<any> {
        return this.http.get(this.apiUrl);
    }
}
