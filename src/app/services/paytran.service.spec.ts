import { TestBed } from '@angular/core/testing';

import { PaytranService } from './paytran.service';

describe('PaytranService', () => {
  let service: PaytranService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaytranService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
