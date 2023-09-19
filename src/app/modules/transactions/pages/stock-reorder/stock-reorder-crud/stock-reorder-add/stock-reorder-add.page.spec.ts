import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StockReorderAddPage } from './stock-reorder-add.page';

describe('StockReorderInsertPage', () => {
  let component: StockReorderAddPage;
  let fixture: ComponentFixture<StockReorderAddPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(StockReorderAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
