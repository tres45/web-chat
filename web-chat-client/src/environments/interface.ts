// Создаем интерфейс для своих енв пер-ых

export interface Environment {
  apiKey: string;
  production: boolean;
  signInfbUrl: string;
  signUpfbUrl: string;

  socketUrl: string;
  // fbDbUrl: string;
}
