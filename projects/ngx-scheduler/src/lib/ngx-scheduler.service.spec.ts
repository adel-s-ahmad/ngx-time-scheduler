import { TestBed } from '@angular/core/testing';

import { NgxSchedulerService } from './ngx-scheduler.service';

describe('NgxSchedulerService', () => {
  let service: NgxSchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxSchedulerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
