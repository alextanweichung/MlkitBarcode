import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferOutAddPage } from './transfer-out-add.page';

describe('TransferOutAddPage', () => {
  let component: TransferOutAddPage;
  let fixture: ComponentFixture<TransferOutAddPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferOutAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
