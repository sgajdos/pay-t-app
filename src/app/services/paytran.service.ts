import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaytranService {
  private url = 'http://localhost:5141/api/transactions';

  constructor(private httpClient: HttpClient) { }

  getPayTransactions(page: number, pageSize: number) {
    return this.httpClient.get(this.url + '?pageNumber=' + page + '&pageSize=' + pageSize)
  }
}
