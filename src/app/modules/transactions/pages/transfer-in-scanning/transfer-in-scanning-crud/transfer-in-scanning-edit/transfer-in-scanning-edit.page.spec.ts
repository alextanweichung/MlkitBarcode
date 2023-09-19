import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInScanningEditPage } from './transfer-in-scanning-edit.page';

describe('TransferInScanningEditPage', () => {
  let component: TransferInScanningEditPage;
  let fixture: ComponentFixture<TransferInScanningEditPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInScanningEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
