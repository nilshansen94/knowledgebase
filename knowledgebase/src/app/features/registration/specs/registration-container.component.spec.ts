import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RegistrationContainerComponent} from '../container/registration-container.component';
import {provideHttpClient} from '@angular/common/http';

describe('RegistrationContainerComponent', () => {
  let component: RegistrationContainerComponent;
  let fixture: ComponentFixture<RegistrationContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationContainerComponent],
      providers: [
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
