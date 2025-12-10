import { IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioAvatarDto {
  @IsOptional()
  @IsString({ message: 'El avatar debe ser una cadena de texto' })
  avatar?: string;
}
