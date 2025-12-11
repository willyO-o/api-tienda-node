import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ContactosService, PaginationResult } from './contactos.service';
import { Contacto } from './entities/contacto.entity';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/contactos')
export class ContactosController {
  constructor(private contactosService: ContactosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createContactoDto: CreateContactoDto): Promise<Contacto> {
    return this.contactosService.create(createContactoDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('estado') estado?: string,
  ): Promise<PaginationResult> {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
    return this.contactosService.findAll(pageNum, pageSizeNum, search, estado);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<Contacto> {
    const contacto = await this.contactosService.findOne(parseInt(id));
    if (!contacto) {
      throw new NotFoundException(`Contacto con id ${id} no encontrado`);
    }
    return contacto;
  }

  @Put(':id/estado')
  @UseGuards(JwtAuthGuard)
  async updateEstado(
    @Param('id') id: string,
    @Body() body: { estado: string },
  ): Promise<Contacto | null> {
    return this.contactosService.updateEstado(parseInt(id), body.estado);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.contactosService.remove(parseInt(id));
    return { success };
  }
}
