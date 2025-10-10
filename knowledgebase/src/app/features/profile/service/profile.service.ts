import {Injectable} from '@angular/core';
import {MyHttpService} from '../../../services/http/my-http.service';
import {map} from 'rxjs/operators';
import {take} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  myUsername$ = this.http.get2<{name: string}>('my-username').pipe(
    map(res => res?.name)
  );

  constructor(private readonly http: MyHttpService) { }

  importFile(file: File) {
    const formData = new FormData();
    formData.append('importData', file, file.name);
    this.http.post('import', formData).pipe(
      take(1),
    ).subscribe(c => console.log(c));
  }
}
