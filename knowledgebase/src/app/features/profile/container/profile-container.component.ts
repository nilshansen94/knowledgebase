import {Component} from '@angular/core';
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

  constructor(public profileService: ProfileService) {}

}
