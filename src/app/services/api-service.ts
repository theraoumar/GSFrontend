import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  host = environment.host;

  constructor(private http:HttpClient) { }

  login(data:any){ 
    return this.http.post<any>(this.host + 'auth/login', data);
  }

  register(data:any) {
    return this.http.post<any>(this.host + 'auth/register', data);
  }


}
