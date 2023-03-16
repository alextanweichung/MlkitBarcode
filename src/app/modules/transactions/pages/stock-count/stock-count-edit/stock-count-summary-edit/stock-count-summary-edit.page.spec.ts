import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StockCountSummaryEditPage } from './stock-count-summary-edit.page';

describe('StockCountSummaryEditPage', () => {
  let component: StockCountSummaryEditPage;
  let fixture: ComponentFixture<StockCountSummaryEditPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StockCountSummaryEditPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StockCountSummaryEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
