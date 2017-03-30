import { Component, OnInit, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { RouteItemExtra } from "../models/RouteItemExtra";

@Component({
  selector: 'rowsorted',
  templateUrl: './rowsorted.component.html',
  styleUrls: ['./rowsorted.component.css']
})
export class RowsortedComponent {

  @Input()
  item: RouteItemExtra;

  @Output()
  onReset: EventEmitter<RouteItemExtra> = new EventEmitter();

  constructor(public el: ElementRef) { }

  reset() {
    this.onReset.emit(this.item);
  }

}
