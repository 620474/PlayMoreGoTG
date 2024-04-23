import { AppService } from './app.service';

const add = [
  {
    id: 1,
    name: 'Привязать профиль',
    isCompleted: false,
  },
];

export class AppProvider {
  constructor(
    private readonly appService: AppService,
  ) {}
}
