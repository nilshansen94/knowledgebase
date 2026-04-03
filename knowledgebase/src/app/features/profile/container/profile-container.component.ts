import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from '../component/profile.component';
import {ProfileService} from '../service/profile.service';

@Component({
  selector: 'app-profile-container',
  imports: [CommonModule, ProfileComponent],
  template: `<app-profile
              [username]="profileService.myUsername$ | async"
              (importFile)="profileService.importFile($event)"
            />`,
  styles: ``,
})
export class ProfileContainerComponent {

  public readonly profileService = inject(ProfileService);

}
