import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { UserComponent } from './components/user/user.component';
import { MenuComponent } from './components/menu/menu.component';
import { HomeComponent } from './components/home/home.component';
import { ShowRestaurantComponent } from './components/restaurant/showRestaurant/showRestaurant.component';
import { RestaurantProfileComponent } from './components/restaurantProfile/restaurantProfile.component';
import { SearchComponent } from './components/search/search.component';
import { AuthFbComponent } from './components/authFb/authFb.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthGuard } from './guards/notAuth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const Router: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: 'home/restaurant/:_id', redirectTo: '/restaurant/:_id', pathMatch: 'full'},
  { path: 'search/:search/restaurant/:_id', redirectTo: '/restaurant/:_id', pathMatch: 'full'},
  { path: '*/search/:search', redirectTo: 'search/:search', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [NotAuthGuard]},
  { path: 'userProfile', component: UserComponent, canActivate: [AuthGuard]},
  { path: 'restaurant/:_id', component: ShowRestaurantComponent},
  { path: 'restaurantProfile', component: RestaurantProfileComponent },
  { path: 'search/:search', component: SearchComponent },
  { path: 'menu', component: MenuComponent},
  { path: 'home', component: HomeComponent},
  { path: 'auth/:username/:token', component: AuthFbComponent, canActivate: [NotAuthGuard]},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '/home'}
];
export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(Router);
