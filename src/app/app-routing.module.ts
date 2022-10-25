import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PublicGuard } from './core/guards/public.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome', // TODO: Set this to ''
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./modules/secure/secure.module').then(m => m.SecureModule),
    // canActivate: [AuthGuard] // Secure all child pages
  },
  {
    path: 'welcome',
    loadChildren: () => import('./modules/public/welcome/welcome.module').then(m => m.WelcomePageModule),
    // canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'signin',
    loadChildren: () => import('./modules/public/signin/signin.module').then(m => m.SigninPageModule),
    // canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'signup',
    loadChildren: () => import('./modules/public/signup/signup.module').then(m => m.SignupPageModule),
    // canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'password-reset',
    loadChildren: () => import('./modules/public/password-reset/password-reset.module').then( m => m.PasswordResetPageModule),
    // canActivate: [PublicGuard] // Prevent for signed in users
  },
  {
    path: 'quotation',
    loadChildren: () => import('./modules/transactions/pages/quotation/quotation.module').then( m => m.QuotationPageModule)
  },
  {
    path: 'filter',
    loadChildren: () => import('./modules/transactions/pages/filter/filter.module').then( m => m.FilterPageModule)
  },
  {
    path: 'listing-skeleton',
    loadChildren: () => import('./shared/pages/listing-skeleton/listing-skeleton.module').then( m => m.ListingSkeletonPageModule)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./modules/transactions/pages/transactions/transactions.module').then( m => m.TransactionsPageModule)
  },
  {
    path: 'item-details',
    loadChildren: () => import('./shared/pages/item-details/item-details.module').then( m => m.ItemDetailsPageModule)
  },
  {
    path: 'sales-order',
    loadChildren: () => import('./modules/transactions/pages/sales-order/sales-order.module').then( m => m.SalesOrderPageModule)
  },
  {
    path: 'search-dropdown',
    loadChildren: () => import('./shared/pages/search-dropdown/search-dropdown.module').then( m => m.SearchDropdownPageModule)
  },
  {
    path: 'item-add-grid',
    loadChildren: () => import('./shared/pages/item-add-grid/item-add-grid.module').then( m => m.ItemAddGridPageModule)
  },
  {
    path: 'item-cart',
    loadChildren: () => import('./shared/pages/item-cart/item-cart.module').then( m => m.ItemCartPageModule)
  },
  {
    path: 'others',
    loadChildren: () => import('./modules/others/pages/others/others.module').then( m => m.OthersPageModule)
  },  {
    path: 'check-balance',
    loadChildren: () => import('./modules/others/pages/check-balance/check-balance.module').then( m => m.CheckBalancePageModule)
  },



];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
