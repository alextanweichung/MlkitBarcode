import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferOutEditPage } from './transfer-out-edit.page';

describe('TransferOutEditPage', () => {
  let component: TransferOutEditPage;
  let fixture: ComponentFixture<TransferOutEditPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferOutEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
