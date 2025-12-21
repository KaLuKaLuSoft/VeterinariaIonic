import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoginmenusService {
    private apiUrlGet = 'https://localhost:7033/api/LoginMenus'; // Reemplaza con tu URL de API
    private apiUrlGetBy = 'https://localhost:7033/api/LoginMenus';
    private apiUrlPost = 'https://localhost:7033/api/LoginMenus';
    private apiUrlPut = 'https://localhost:7033/api/LoginMenus/';
    constructor(private http: HttpClient) { }

    private isBrowser(): boolean {
        return typeof window !== 'undefined';
    }

    getData(): Observable<any> {
        let token = '';

        // Verifica si el código está corriendo en el navegador antes de usar sessionStorage
        if (this.isBrowser()) {
            token = sessionStorage.getItem('token') || '';
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get(this.apiUrlGet, { headers });
    }

    getDataById(id: string | number): Observable<any> {
        const url = `${this.apiUrlGetBy}/${id}`;

        let token = '';

        if (this.isBrowser()) {
            token = sessionStorage.getItem('token') || '';
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get(url, { headers });
    }

    postData(data: any): Observable<any> {
        let token = '';

        if (this.isBrowser()) {
            token = sessionStorage.getItem('token') || '';
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.post(this.apiUrlPost, data, { headers });
    }

    updateData(id: string | number, data: any): Observable<any> {
        const url = `${this.apiUrlPut}${id}`;
        let token = '';

        if (this.isBrowser()) {
            token = sessionStorage.getItem('token') || '';
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.put(url, data, { headers });
    }

    deleteData(id: string | number): Observable<any> {
        const url = `${this.apiUrlGet}/${id}`;
        let token = '';

        if (this.isBrowser()) {
            token = sessionStorage.getItem('token') || '';
        }

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.delete(url, { headers });
    }
}
