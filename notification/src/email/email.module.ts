import { Module } from '@nestjs/common';
import { ResendModule } from './resend/resend.module';
import { EmailDispatchService } from './email-dispatch.service';

@Module({
  imports: [ResendModule],
  providers: [EmailDispatchService],
  exports: [EmailDispatchService],
})
export class EmailModule {}
