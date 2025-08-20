import {TestBed} from '@angular/core/testing';

import {AppService} from '../app.service';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ]
    });
    service = TestBed.inject(AppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
