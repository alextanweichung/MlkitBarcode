import { TestBed } from '@angular/core/testing';

import { PurchaseReqService } from './purchase-req.service';

describe('PurchaseReqService', () => {
  let service: PurchaseReqService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseReqService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
