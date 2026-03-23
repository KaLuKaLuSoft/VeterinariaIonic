import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'paginate',
    pure: false,
    standalone: true
})
export class PaginatePipe implements PipeTransform {
    transform(array: any[], itemsPerPage: number, currentPage: number): any[] {
        if (!array || array.length === 0) return [];
        const startIndex = (currentPage - 1) * itemsPerPage;
        return array.slice(startIndex, startIndex + itemsPerPage);
    }
}
