import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxTimeSchedulerService } from '@adelsoli/ngx-scheduler';

import { routes } from './app.routes';
import { MockHttpInterceptor } from './mock-http.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: MockHttpInterceptor, multi: true },
    NgxTimeSchedulerService
  ]
};
