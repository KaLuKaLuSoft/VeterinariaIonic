import { Injectable } from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppResumeService {

    private resumeSubject = new Subject<void>();
    resume$ = this.resumeSubject.asObservable();

    constructor() {
        merge(
            fromEvent(window, 'focus'),
            fromEvent(window, 'online')
        ).subscribe(() => {
            console.log('App reanudada');
            this.resumeSubject.next();
        });
    }
}