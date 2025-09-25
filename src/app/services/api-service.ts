import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  minStock: number;
  supplier: string;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
  user: string;
}

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
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.host + 'products');
  }
 
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(this.host + 'products/' + id);
  }

  updateProduct(id: number, data: any): Observable<Product> {
    return this.http.put<Product>(this.host + 'products/' + id, data);
  }

  addProduct(data: any): Observable<Product> {
    return this.http.post<Product>(this.host + 'products', data);
  }
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(this.host + 'products/' + id);
  }

  getStockMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(this.host + 'stock-movements');
  }

  addStockMovement(data: any): Observable<StockMovement> {
    return this.http.post<StockMovement>(this.host + 'stock-movements', data);
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.host + 'products?lowStock=true');
  }

  getStockStats(): Observable<any> {
    return this.http.get<any>(this.host + 'stats/stock');
  }
  
}
