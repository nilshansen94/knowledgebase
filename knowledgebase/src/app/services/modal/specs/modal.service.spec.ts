import {TestBed} from '@angular/core/testing';
import {ModalService} from '../modal.service';
import {BsModalService} from 'ngx-bootstrap/modal';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BsModalService],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
