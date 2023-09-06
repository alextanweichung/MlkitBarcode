import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TransferInAddPage } from './transfer-in-add.page';

describe('TransferInAddPage', () => {
  let component: TransferInAddPage;
  let fixture: ComponentFixture<TransferInAddPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(TransferInAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
