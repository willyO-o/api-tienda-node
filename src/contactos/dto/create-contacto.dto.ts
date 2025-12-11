import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class CreateContactoDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
  nombre_completo: string;

  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  correo: string;

  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
  mensaje: string;
}
