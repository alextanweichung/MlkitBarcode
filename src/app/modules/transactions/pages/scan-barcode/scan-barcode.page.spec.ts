import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScanBarcodePage } from './scan-barcode.page';

describe('ScanBarcodePage', () => {
  let component: ScanBarcodePage;
  let fixture: ComponentFixture<ScanBarcodePage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(ScanBarcodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
