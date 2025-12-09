import { IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'El avatar debe ser una cadena de texto' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'El password debe ser una cadena de texto' })
  @MinLength(6, { message: 'El password debe tener al menos 6 caracteres' })
  password?: string;
}
