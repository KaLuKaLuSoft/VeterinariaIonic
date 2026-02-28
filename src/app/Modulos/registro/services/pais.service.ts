import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, tap } from 'rxjs';

export interface Pais {
  id: number;
  nombre: string;
  codigo: string;
  activo: boolean;
  banderaUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaisService {

  private apiUrl = 'https://localhost:7033/api/Paises';

  constructor(private http: HttpClient) { }

  getPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }
}
