import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsNotEmpty({ message: 'El password es obligatorio' })
  @IsString({ message: 'El password debe ser una cadena de texto' })
  @MinLength(6, { message: 'El password debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'El avatar debe ser una cadena de texto' })
  avatar?: string;
}
