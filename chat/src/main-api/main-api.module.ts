import { Global, Module } from '@nestjs/common';
import { MainApiClient } from './main-api.client';

@Global()
@Module({
  providers: [MainApiClient],
  exports: [MainApiClient],
})
export class MainApiModule {}
