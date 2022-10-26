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
    loadChildren: () => import('./modules/public/password-reset/password-reset.module').then(m => m.PasswordResetPageModule),
    // canActivate: [PublicGuard] // Prevent for signed in users
  },

  // process
  {
    path: 'processes',
    loadChildren: () => import('./modules/processes/pages/processes/processes.module').then(m => m.ProcessesPageModule)
  },
  // process-quotation
  {
    path: 'processes/quotation-pending-review',
    loadChildren: () => import('./modules/processes/pages/quotation-pending-review/quotation-pending-review.module').then( m => m.QuotationPendingReviewPageModule)
  },
  {
    path: 'processes/quotation-completed-review',
    loadChildren: () => import('./modules/processes/pages/quotation-completed-review/quotation-completed-review.module').then( m => m.QuotationCompletedReviewPageModule)
  },
  {
    path: 'processes/quotation-pending-approval',
    loadChildren: () => import('./modules/processes/pages/quotation-pending-approval/quotation-pending-approval.module').then(m => m.QuotationPendingApprovalPageModule)
  },
  {
    path: 'processes/quotation-completed-approval',
    loadChildren: () => import('./modules/processes/pages/quotation-completed-approval/quotation-completed-approval.module').then( m => m.QuotationCompletedApprovalPageModule)
  },
  {
    path: 'processes/sales-order-pending-review',
    loadChildren: () => import('./modules/processes/pages/sales-order-pending-review/sales-order-pending-review.module').then( m => m.SalesOrderPendingReviewPageModule)
  },
  {
    path: 'processes/sales-order-completed-review',
    loadChildren: () => import('./modules/processes/pages/sales-order-completed-review/sales-order-completed-review.module').then( m => m.SalesOrderCompletedReviewPageModule)
  },
  {
    path: 'processes/sales-order-pending-approval',
    loadChildren: () => import('./modules/processes/pages/sales-order-pending-approval/sales-order-pending-approval.module').then( m => m.SalesOrderPendingPageModule)
  },
  {
    path: 'processes/sales-order-completed-approval',
    loadChildren: () => import('./modules/processes/pages/sales-order-completed-approval/sales-order-completed-approval.module').then( m => m.SalesOrderCompletedPageModule)
  },

  // transaction
  {
    path: 'transactions',
    loadChildren: () => import('./modules/transactions/pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
  },
  // transaction-quotation
  {
    path: 'transactions/quotation',
    loadChildren: () => import('./modules/transactions/pages/quotation/quotation.module').then(m => m.QuotationPageModule)
  },
  {
    path: 'transactions/quotation/quotation-detail',
    loadChildren: () => import('./modules/transactions/pages/quotation/quotation-detail/detail/detail.module').then(m => m.DetailPageModule)
  },
  // transaction-sales-order
  {
    path: 'transactions/sales-order',
    loadChildren: () => import('./modules/transactions/pages/sales-order/sales-order.module').then(m => m.SalesOrderPageModule)
  },
  {
    path: 'transactions/sales-order/sales-order-detail',
    loadChildren: () => import('./modules/transactions/pages/sales-order/sales-order-detail/detail/detail.module').then(m => m.DetailPageModule)
  },

  // others
  {
    path: 'others',
    loadChildren: () => import('./modules/others/pages/others/others.module').then(m => m.OthersPageModule)
  },
  // others-check-balance
  {
    path: 'others/check-balance',
    loadChildren: () => import('./modules/others/pages/check-balance/check-balance.module').then(m => m.CheckBalancePageModule)
  },

  // shared
  {
    path: 'filter',
    loadChildren: () => import('./modules/transactions/pages/filter/filter.module').then(m => m.FilterPageModule)
  },
  {
    path: 'listing-skeleton',
    loadChildren: () => import('./shared/pages/listing-skeleton/listing-skeleton.module').then(m => m.ListingSkeletonPageModule)
  },
  {
    path: 'item-details',
    loadChildren: () => import('./shared/pages/item-details/item-details.module').then(m => m.ItemDetailsPageModule)
  },
  {
    path: 'search-dropdown',
    loadChildren: () => import('./shared/pages/search-dropdown/search-dropdown.module').then(m => m.SearchDropdownPageModule)
  },
  {
    path: 'item-add-grid',
    loadChildren: () => import('./shared/pages/item-add-grid/item-add-grid.module').then(m => m.ItemAddGridPageModule)
  },
  {
    path: 'item-cart',
    loadChildren: () => import('./shared/pages/item-cart/item-cart.module').then(m => m.ItemCartPageModule)
  },
  {
    path: 'transaction-processing',
    loadChildren: () => import('./shared/pages/transaction-processing/transaction-processing.module').then( m => m.TransactionProcessingPageModule)
  },




];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
