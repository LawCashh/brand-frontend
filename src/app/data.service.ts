import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getData<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getDataWithParams<T>(url: string, params: HttpParams): Observable<T> {
    return this.http.get<T>(url, { params });
  }
}
