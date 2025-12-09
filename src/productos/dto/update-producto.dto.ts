import { IsOptional, IsString, IsNumber, IsArray, IsInt, Min, IsPositive } from 'class-validator';

export class UpdateProductoDto {
  @IsOptional()
  @IsString({ message: 'El campo titulo debe ser una cadena de texto' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion debe ser una cadena de texto' })
  descripcion?: string;

  @IsOptional()
  @IsArray({ message: 'El campo imagen debe ser un arreglo' })
  imagen?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'El campo precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  precio?: number;

  @IsOptional()
  @IsInt({ message: 'El campo stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  @IsOptional()
  @IsInt({ message: 'El campo categoria_id debe ser un número entero' })
  @IsPositive({ message: 'El categoria_id debe ser mayor a 0' })
  categoria_id?: number;
}
