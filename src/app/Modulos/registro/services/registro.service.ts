import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroRequest {
    NombreComercial: string;
    NumeroTrabajadores: number;
    IdPais: number;
    IdCiudad: number;
    NombreEmpleado: string;
    Celular: string;
    Usuario: string;
    Contrasena: string;
}

@Injectable({
    providedIn: 'root'
})
export class RegistroService {

    private apiUrl = 'https://localhost:7033/api/Registro';

    constructor(private http: HttpClient) { }

    registrar(data: RegistroRequest): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }
    verificarEmail(email: string) {
        return this.http.get<boolean>(`${this.apiUrl}/verificar-email?email=${email}`);
    }
}