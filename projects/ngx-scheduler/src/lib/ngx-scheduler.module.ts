import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { NgxTimeSchedulerComponent } from './ngx-scheduler.component';

@NgModule({
  declarations: [NgxTimeSchedulerComponent],
  imports: [
    CommonModule,
    DragDropModule
  ],
  exports: [NgxTimeSchedulerComponent]
})
export class NgxTimeSchedulerModule {
}
