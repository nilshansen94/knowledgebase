import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SnippetsContainerComponent} from "../../snippets/container/snippets-container.component";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, SnippetsContainerComponent],
  template: `
    <h1>My Snippets</h1>
    <app-snippets-container />
  `,
  styles: [
  ]
})
export class HomePageContainerComponent {

}
