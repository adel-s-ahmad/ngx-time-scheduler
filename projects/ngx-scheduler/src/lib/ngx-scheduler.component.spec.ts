import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSchedulerComponent } from './ngx-scheduler.component';

describe('NgxSchedulerComponent', () => {
  let component: NgxSchedulerComponent;
  let fixture: ComponentFixture<NgxSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxSchedulerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
