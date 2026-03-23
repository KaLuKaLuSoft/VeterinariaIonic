import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TipoDocumentoService {
    private apiUrl = 'https://localhost:7033/api/TipoDocumentos'; // Assuming standard pluralization
    private http = inject(HttpClient);

    getTipoDocumentos(): Observable<any> {
        return this.http.get(this.apiUrl).pipe(
            catchError(error => {
                console.error('Error fetching TipoDocumentos:', error);
                return of([]); // Return empty array on error so UI doesn't crash
            })
        );
    }
}
