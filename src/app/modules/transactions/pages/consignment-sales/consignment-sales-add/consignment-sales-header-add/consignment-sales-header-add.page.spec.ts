import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConsignmentSalesHeaderAddPage } from './consignment-sales-header-add.page';

describe('ConsignmentSalesHeaderAddPage', () => {
  let component: ConsignmentSalesHeaderAddPage;
  let fixture: ComponentFixture<ConsignmentSalesHeaderAddPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsignmentSalesHeaderAddPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsignmentSalesHeaderAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
