import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { NgxTimeSchedulerComponent } from './ngx-scheduler.component';
import { AttendeeComboboxComponent } from './attendee-combobox/attendee-combobox.component';

@NgModule({
  declarations: [NgxTimeSchedulerComponent],
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    HttpClientModule,
    AttendeeComboboxComponent
  ],
  exports: [NgxTimeSchedulerComponent, AttendeeComboboxComponent]
})
export class NgxTimeSchedulerModule {
}
