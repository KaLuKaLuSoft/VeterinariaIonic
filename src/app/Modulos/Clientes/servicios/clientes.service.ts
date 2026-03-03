import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
    id: number;
    nombreCliente: string;
    direccionCliente: string;
    email: string;
    celular: number;
    observaciones: string;
    idTipoCliente: number;
    idCiudad: number;
    idEmpresa: number;
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ClientesService {
    private apiUrl = 'https://localhost:7033/api/Clientes';
    private http = inject(HttpClient);

    constructor() { }

    /**
     * Obtiene el idEmpresa decodificando el token almacenado en sessionStorage.
     * El token es un JWT con formato header.payload.signature.
     */
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
            // El usuario confirmó que es "IdEmpresa" con I mayúscula
            return decodedToken.IdEmpresa || decodedToken.idEmpresa || null;
        } catch (error) {
            console.error('Error al decodificar el token:', error);
            return null;
        }
    }

    /**
     * Obtiene la lista de clientes, enviando el idEmpresa obtenido del token.
     */
    getClientes(): Observable<any> {
        const idEmpresa = this.getIdEmpresaFromToken();
        console.log('idEmpresa extraído del token:', idEmpresa);

        const url = idEmpresa ? `${this.apiUrl}?idEmpresa=${idEmpresa}` : this.apiUrl;
        return this.http.get(url);
    }

    /**
     * Crea un nuevo cliente enviando un POST a la API.
     * @param cliente Objeto con los datos del cliente a registrar.
     */
    postCliente(cliente: Cliente): Observable<any> {
        return this.http.post(this.apiUrl, cliente, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * Actualiza un cliente existente enviando un PUT a la API.
     * @param id ID del cliente a actualizar.
     * @param cliente Objeto con los datos actualizados del cliente.
     */
    putCliente(id: number, cliente: Cliente): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, cliente, {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    /**
     * Elimina un cliente enviando un DELETE a la API.
     * Usa getIdEmpresaFromToken() para obtener el idEmpresa del token
     * y lo envía como query parameter.
     * @param id ID del cliente a eliminar.
     */
    deleteCliente(id: number): Observable<any> {
        const idEmpresa = this.getIdEmpresaFromToken();
        console.log('idEmpresa para DELETE:', idEmpresa);

        const url = idEmpresa
            ? `${this.apiUrl}/${id}?idEmpresa=${idEmpresa}`
            : `${this.apiUrl}/${id}`;

        return this.http.delete(url, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
