import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'paginate',
    pure: false // Importante: permite que el pipe reaccione a cambios en el array
})
export class PaginatePipe implements PipeTransform {
    /**
     * @param array El array original de clientes
     * @param itemsPerPage Cantidad de elementos por página (10, 20, etc.)
     * @param currentPage La página actual en la que estamos
     */
    transform(array: any[], itemsPerPage: number, currentPage: number): any[] {
        if (!array || array.length === 0) return [];

        // Calculamos el índice inicial: (Página - 1) * cantidad
        // Ejemplo: Página 2, 10 items -> (2-1) * 10 = Empezar en índice 10
        const startIndex = (currentPage - 1) * itemsPerPage;

        // Retornamos el segmento del array
        return array.slice(startIndex, startIndex + itemsPerPage);
    }
}