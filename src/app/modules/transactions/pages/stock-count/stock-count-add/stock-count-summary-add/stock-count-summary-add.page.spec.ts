import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StockCountSummaryAddPage } from './stock-count-summary-add.page';

describe('StockCountSummaryAddPage', () => {
  let component: StockCountSummaryAddPage;
  let fixture: ComponentFixture<StockCountSummaryAddPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StockCountSummaryAddPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StockCountSummaryAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
