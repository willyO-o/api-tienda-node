import { Exclude } from 'class-transformer';

export class UsuarioDto {
  id: number;
  email: string;

  @Exclude()
  password: string;

  estado: string;
  avatar: string;
  creado_el: Date;
}
