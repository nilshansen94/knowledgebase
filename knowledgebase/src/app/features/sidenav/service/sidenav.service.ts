import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";
import {NavItem} from "../component/api/nav-item";

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  navItems$: Observable<NavItem[]> = of([
    {label: 'Nav 1'},
    {label: 'Nav 2'},
  ]);

}
