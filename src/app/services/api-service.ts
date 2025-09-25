import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
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

  constructor(private http: HttpClient) { }

  // Méthode pour obtenir les headers avec le token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // AUTHENTIFICATION
  login(data: any) { 
    return this.http.post<any>(this.host + 'auth/login', data);
  }

  register(data: any) {
    return this.http.post<any>(this.host + 'auth/register', data);
  }
  // PRODUITS
  getProducts(): Observable<Product[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Product[]>(this.host + 'produits', { headers });
  }

  getProduct(id: number): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.get<Product>(this.host + 'produits/' + id, { headers });
  }

  updateProduct(id: number, data: any): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.put<Product>(this.host + 'produits/' + id, data, { headers });
  }

  addProduct(data: any): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.post<Product>(this.host + 'produits/add', data, { headers });
  }

  deleteProduct(id: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(this.host + 'produits/' + id, { headers });
  }

  // STOCK MOVEMENTS
  getStockMovements(): Observable<StockMovement[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<StockMovement[]>(this.host + 'stock-movements', { headers });
  }

  addStockMovement(data: any): Observable<StockMovement> {
    const headers = this.getAuthHeaders();
    return this.http.post<StockMovement>(this.host + 'stock-movements', data, { headers });
  }

  // PRODUITS EN STOCK FAIBLE - CORRIGÉ
  getLowStockProducts(): Observable<Product[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Product[]>(this.host + 'produits/low-stock', { headers });
  }

  // STATISTIQUES
  getStockStats(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(this.host + 'stats/stock', { headers });
  }
}