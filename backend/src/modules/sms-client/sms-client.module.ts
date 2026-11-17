import { Module } from '@nestjs/common';
import { SmsClientService } from './sms-client.service';

@Module({
  providers: [SmsClientService],
  exports: [SmsClientService],
})
export class SmsClientModule {}