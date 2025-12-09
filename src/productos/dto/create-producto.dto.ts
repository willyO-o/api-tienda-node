import { IsNotEmpty, IsString, IsNumber, IsArray, IsInt, Min, IsPositive } from 'class-validator';

export class CreateProductoDto {
  @IsNotEmpty({ message: 'El campo titulo es obligatorio' })
  @IsString({ message: 'El campo titulo debe ser una cadena de texto' })
  titulo: string;

  @IsNotEmpty({ message: 'El campo descripcion es obligatorio' })
  @IsString({ message: 'El campo descripcion debe ser una cadena de texto' })
  descripcion: string;

  @IsNotEmpty({ message: 'El campo imagen es obligatorio' })
  @IsArray({ message: 'El campo imagen debe ser un arreglo' })
  imagen: string[];

  @IsNotEmpty({ message: 'El campo precio es obligatorio' })
  @IsNumber({}, { message: 'El campo precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  precio: number;

  @IsNotEmpty({ message: 'El campo stock es obligatorio' })
  @IsInt({ message: 'El campo stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;

  @IsNotEmpty({ message: 'El campo categoria_id es obligatorio' })
  @IsInt({ message: 'El campo categoria_id debe ser un número entero' })
  @IsPositive({ message: 'El categoria_id debe ser mayor a 0' })
  categoria_id: number;
}
