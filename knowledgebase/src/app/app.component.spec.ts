import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {BsModalService} from 'ngx-bootstrap/modal';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      AppComponent,
    ],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      BsModalService,
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
