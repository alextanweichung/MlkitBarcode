import { TestBed } from '@angular/core/testing';

import { BarcodeScanInputService } from './barcode-scan-input.service';

describe('BarcodeScanInputService', () => {
  let service: BarcodeScanInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BarcodeScanInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
