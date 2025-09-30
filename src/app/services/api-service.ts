import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  categorie: string;
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

  // BehaviorSubject pour gérer le rafraîchissement automatique
  private refreshSubject = new BehaviorSubject<boolean>(true);
  public refresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Méthode pour déclencher le rafraîchissement
  triggerRefresh(): void {
    this.refreshSubject.next(true);
  }

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

  // PRODUITS - modifiées pour déclencher le rafraîchissement
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
    return this.http.put<Product>(this.host + 'produits/' + id, data, { headers }).pipe(
      tap(() => {
        // Déclencher le rafraîchissement après modification
        this.triggerRefresh();
      })
    );
  }

  addProduct(data: any): Observable<Product> {
    const headers = this.getAuthHeaders();
    return this.http.post<Product>(this.host + 'produits/add', data, { headers }).pipe(
      tap(() => {
        // Déclencher le rafraîchissement après ajout
        this.triggerRefresh();
      })
    );
  }

  deleteProduct(id: number): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.delete(this.host + 'produits/' + id, { 
    headers,
    responseType: 'text' // Spécifier explicitement le type de réponse
  }).pipe(
    tap((response) => {
      console.log('Réponse suppression:', response);
      // Déclencher le rafraîchissement après suppression
      this.triggerRefresh();
    }),
    catchError(error => {
      console.error('Erreur lors de la suppression:', error);
      return throwError(error);
    })
  );
}

  // STOCK MOVEMENTS
  getStockMovements(): Observable<StockMovement[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<StockMovement[]>(this.host + 'stock-movements', { headers });
  }

  addStockMovement(data: any): Observable<StockMovement> {
    const headers = this.getAuthHeaders();
    return this.http.post<StockMovement>(this.host + 'stock-movements', data, { headers }).pipe(
      tap(() => {
        // Déclencher le rafraîchissement après mouvement de stock
        this.triggerRefresh();
      })
    );
  }

  // PRODUITS EN STOCK FAIBLE
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