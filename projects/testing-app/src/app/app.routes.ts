import { Routes } from '@angular/router';
import { TestAsyncAttendeesComponent } from './test-async-attendees.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'test-async-attendees', pathMatch: 'full' },
	{ path: 'test-async-attendees', component: TestAsyncAttendeesComponent }
];
