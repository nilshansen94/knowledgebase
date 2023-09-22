import { Injectable } from '@angular/core';
import {of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SnippetsService {

  private lorem = `Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
  sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
  sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
  Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
  invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
  justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. `;

  snippets$ = of([
    {title: 'snippet 1', content: this.lorem},
    {title: 'snippet 2', content: this.lorem + this.lorem},
    {title: 'snippet 3', content: this.lorem + this.lorem},
    {title: 'snippet 4', content: this.lorem},
    {title: 'snippet 5', content: this.lorem},
    {title: 'snippet 6', content: this.lorem},
  ]);

  constructor() { }
}
