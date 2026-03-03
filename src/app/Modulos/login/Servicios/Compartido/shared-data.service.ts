import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SharedDataService {
    private userDataSubject = new BehaviorSubject<any>(null);
    userData$ = this.userDataSubject.asObservable();

    constructor() { }

    setUserData(id: any, usuario: any, nombreSucursal: any, roles: any, idSucursal: any, empleado: any, idEmpresa: any, empresa: any, idPais: any) {
        const data = { id, usuario, nombreSucursal, roles, idSucursal, empleado, idEmpresa, empresa, idPais };
        this.userDataSubject.next(data);
    }

    clearUserData() {
        this.userDataSubject.next(null);
    }

    getUserData() {
        return this.userDataSubject.value;
    }
}
