import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RpSaPerformanceListingPage } from './rp-sa-performance-listing.page';

describe('RpSaPerformanceListingPage', () => {
  let component: RpSaPerformanceListingPage;
  let fixture: ComponentFixture<RpSaPerformanceListingPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RpSaPerformanceListingPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RpSaPerformanceListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
