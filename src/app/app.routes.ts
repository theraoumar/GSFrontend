
import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { LoginPage } from './Page/login/login.page';
import { RegisterPage } from './Page/register/register.page';
import { DashboardPage } from './Page/dashboard/dashboard.page';
import { AddProductPage } from './Page/add-produit/add-produit.component';
import { StockPageComponent } from './Page/stock-page/stock-page.component';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
  },
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
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];