import {Component, input} from '@angular/core';

import {RouterLink} from '@angular/router';

@Component({
  selector: 'kb-rest-welcome',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {

  public loggedIn = input<boolean>(false);

}
