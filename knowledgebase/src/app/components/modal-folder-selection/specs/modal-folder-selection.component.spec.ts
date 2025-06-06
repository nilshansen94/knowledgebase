import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ModalFolderSelectionComponent} from '../modal-folder-selection.component';

describe('ModalFolderSelectionComponent', () => {
  let component: ModalFolderSelectionComponent;
  let fixture: ComponentFixture<ModalFolderSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFolderSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFolderSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
