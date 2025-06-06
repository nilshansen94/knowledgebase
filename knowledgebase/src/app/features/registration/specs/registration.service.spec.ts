import {TestBed} from '@angular/core/testing';
import {RegistrationService} from '../service/registration.service';
import {MyHttpService} from '../../../services/http/my-http.service';
import {provideHttpClient} from '@angular/common/http';

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        RegistrationService,
        MyHttpService,
        provideHttpClient(),
      ]
    });
    service = TestBed.inject(RegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
