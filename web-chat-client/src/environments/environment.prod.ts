import {Environment} from './interface';

// Подключаем свой енв в енв проекта для прода
// Для прода апиКей должен быть другим (тут тест)
export const environment: Environment = {
  production: true,
  apiKey: 'AIzaSyBCdRqYEbGuwYFI81vtir7jp__J_Z2C1mM',
  signInfbUrl: "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",
  signUpfbUrl: "https://identitytoolkit.googleapis.com/v1/accounts:signUp",
  // socketUrl: 'http://localhost:3000',
  socketUrl: 'https://seosadchyi-webchat-server.herokuapp.com/'
};
