import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RowsortedComponent } from './rowsorted.component';

describe('RowsortedComponent', () => {
  let component: RowsortedComponent;
  let fixture: ComponentFixture<RowsortedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RowsortedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RowsortedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
