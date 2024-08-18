import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import { Item, Section } from './ngx-scheduler.model';
import moment, { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class NgxTimeSchedulerService {

  public item = new Subject<Item>();
  public itemAdd = new Subject<Item>();
  public itemId = new Subject<number>();
  public sectionAdd = new Subject<Section>();
  public section = new Subject<Section>();
  public sectionId = new Subject<string>();
  public refreshView = new Subject();
  public changePeriodSub = new Subject<Moment>();

  constructor() {
  }

  public itemPush(item: Item): void {
    this.itemAdd.next(item);
  }

  public itemPop(): void {
    this.item.next(null);
  }

  public itemRemove(id: number): void {
    this.itemId.next(id);
  }

  public sectionPush(section: Section): void {
    this.sectionAdd.next(section);
  }

  public sectionPop(): void {
    this.section.next(null);
  }

  public sectionRemove(id: string): void {
    this.sectionId.next(id);
  }

  public refresh(): void {
    this.refreshView.next(null);
  }

  public updatePeriod(start: Moment): void {
    this.changePeriodSub.next(start);
  }

}
