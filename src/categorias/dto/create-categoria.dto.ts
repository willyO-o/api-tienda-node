import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsNotEmpty({ message: 'El campo categoria es obligatorio' })
  @IsString({ message: 'El campo categoria debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre de la categoría debe tener al menos 3 caracteres' })
  categoria: string;

  @IsNotEmpty({ message: 'El campo estado es obligatorio' })
  @IsString({ message: 'El campo estado debe ser una cadena de texto' })
  estado?: string;
}
