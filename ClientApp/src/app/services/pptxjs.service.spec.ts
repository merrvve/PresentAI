import { TestBed } from '@angular/core/testing';

import { PptxjsService } from './pptxjs.service';

describe('PptxjsService', () => {
  let service: PptxjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PptxjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
