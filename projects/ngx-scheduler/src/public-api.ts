/*
 * Public API Surface of ngx-scheduler
 */

export * from './lib/ngx-scheduler.service';
export * from './lib/ngx-scheduler.component';
export * from './lib/ngx-scheduler.module';
export * from './lib/ngx-scheduler.model';
export { AvailabilityStatus } from './lib/ngx-scheduler.model';
export type { Attendee, AttendeeGroupConfig, AttendeeGroup } from './lib/ngx-scheduler.model';
export { AttendeeComboboxComponent } from './lib/attendee-combobox/attendee-combobox.component';
export { AttendeeService } from './lib/attendee.service';
export type { AsyncLoadConfig } from './lib/attendee-combobox/attendee-combobox.component';
export { LocalizationService } from './lib/localization.service';
