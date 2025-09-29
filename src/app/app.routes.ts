
import { Routes } from '@angular/router';
import { LoginPage } from './Page/login/login.page';
import { RegisterPage } from './Page/register/register.page';
import { DashboardPage } from './Page/dashboard/dashboard.page';
import { AddProductPage } from './Page/add-produit/add-produit.component';
import { StockPageComponent } from './Page/stock-page/stock-page.component';
import { ProductDetailsComponent } from './Page/product-details/product-details.component';
import { EditProductComponent } from './Page/edit-product/edit-product.component';

export const routes: Routes = [

  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'register',
    component: RegisterPage,
  },
  {
    path: 'dashboard',
    component: DashboardPage,
  },
  {
    path: 'add-product',
    component: AddProductPage
  },
  { path: 'stock', 
    component: StockPageComponent
  },
  { path: 'product-details/:id',
    component: ProductDetailsComponent 
  },
  { path: 'edit-product/:id',
    component: EditProductComponent 
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];