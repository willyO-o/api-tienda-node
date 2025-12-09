import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsNotEmpty({ message: 'El password es obligatorio' })
  @IsString({ message: 'El password debe ser una cadena de texto' })
  password: string;
}
