import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SalesOrderCompletedApprovalPage } from './sales-order-completed-approval.page';

describe('SalesOrderCompletedApprovalPage', () => {
  let component: SalesOrderCompletedApprovalPage;
  let fixture: ComponentFixture<SalesOrderCompletedApprovalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesOrderCompletedApprovalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesOrderCompletedApprovalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
