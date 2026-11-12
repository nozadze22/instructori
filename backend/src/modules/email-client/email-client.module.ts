import { Global, Module } from '@nestjs/common';
import { EmailClientService } from './email-client.service';

@Global()
@Module({
  providers: [EmailClientService],
  exports: [EmailClientService],
})
export class EmailClientModule {}
