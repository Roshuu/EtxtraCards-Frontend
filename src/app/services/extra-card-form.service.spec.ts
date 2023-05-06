import { TestBed } from '@angular/core/testing';

import { ExtraCardFormService } from './extra-card-form.service';

describe('ExtraCardFormService', () => {
  let service: ExtraCardFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtraCardFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
