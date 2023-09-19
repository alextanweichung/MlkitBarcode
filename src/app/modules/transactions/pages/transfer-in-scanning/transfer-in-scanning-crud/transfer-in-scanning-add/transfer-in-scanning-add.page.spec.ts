import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInScanningAddPage } from './transfer-in-scanning-add.page';

describe('TransferInScanningAddPage', () => {
  let component: TransferInScanningAddPage;
  let fixture: ComponentFixture<TransferInScanningAddPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInScanningAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
