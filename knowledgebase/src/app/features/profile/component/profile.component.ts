import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {

  @Input() username: string;

  @Output() importFile = new EventEmitter<File>();

  public file: File;

  public baseUrl = environment.baseUrl;

  fileChange(e: any) {
    this.file = e.target.files[0];
  }

  //todo feedback
  startImport(e) {
    if(this.file){
      this.importFile.next(this.file);
    }
    e.preventDefault();
  }

}
