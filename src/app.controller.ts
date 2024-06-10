import { AppService } from './app.service';

export class AppProvider {
  constructor(
    private readonly appService: AppService,
  ) {}
}
