import { Module } from '@nestjs/common';
import { AvatarService } from './services/avatar.service';
import { AvatarsController } from './controllers/avatars.controller';

@Module({
  controllers: [AvatarsController],
  providers: [AvatarService],
  exports: [AvatarService],
})
export class CommonModule {}
