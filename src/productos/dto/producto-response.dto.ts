export class ProductoResponseDto {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string[];
  precio: number;
  stock: number;
  categoria_id: number;
  categoria_nombre?: string;
  creado_el: Date;
}
