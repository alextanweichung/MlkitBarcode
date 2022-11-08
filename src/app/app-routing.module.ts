import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MenuGuard } from './core/guards/menu.guard';

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



  // approval
  {
    path: 'approvals',
    loadChildren: () => import('./modules/approvals/pages/approvals/approvals.module').then(m => m.ApprovalsPageModule),
    // runGuardsAndResolvers: 'always',
    // canActivate: [AuthGuard, MenuGuard]
  },
  // approval-quotation
  {
    path: 'approvals/quotation-reviews',
    loadChildren: () => import('./modules/approvals/pages/quotation-reviews/quotation-reviews.module').then(m => m.QuotationReviewsPageModule),
    // runGuardsAndResolvers: 'always',
    // canActivate: [AuthGuard, MenuGuard]
  },
  {
    path: 'approvals/quotation-approvals',
    loadChildren: () => import('./modules/approvals/pages/quotation-approvals/quotation-approvals.module').then(m => m.QuotationApprovalsPageModule)
  },
  // approval-sales-order
  {
    path: 'approvals/sales-order-reviews',
    loadChildren: () => import('./modules/approvals/pages/sales-order-reviews/sales-order-reviews.module').then(m => m.SalesOrderReviewsPageModule)
  },
  {
    path: 'approvals/sales-order-approvals',
    loadChildren: () => import('./modules/approvals/pages/sales-order-approvals/sales-order-approvals.module').then(m => m.SalesOrderApprovalsPageModule)
  },
  // approval-purchase-order  
  {
    path: 'approvals/purchase-order-reviews',
    loadChildren: () => import('./modules/approvals/pages/purchase-order-reviews/purchase-order-reviews.module').then( m => m.PurchaseOrderReviewsPageModule)
  },
  {
    path: 'approvals/purchase-order-approvals',
    loadChildren: () => import('./modules/approvals/pages/purchase-order-approvals/purchase-order-approvals.module').then( m => m.PurchaseOrderApprovalsPageModule)
  },



  // transaction
  {
    title: 'MACA001',
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
  // transactions-purchase-order
  {
    path: 'transactions/purchase-order/purchase-order-detail',
    loadChildren: () => import('./modules/transactions/pages/purchase-order/purchase-order-detail/purchase-order-detail.module').then( m => m.PurchaseOrderDetailPageModule)
  },
  // transaction-picking  
  {
    path: 'transactions/picking',
    loadChildren: () => import('./modules/transactions/pages/picking/picking.module').then(m => m.PickingPageModule)
  },
  {
    path: 'transactions/picking/picking-detail',
    loadChildren: () => import('./modules/transactions/pages/picking/picking-detail/detail/detail.module').then(m => m.DetailPageModule)
  },
  // transaction-packing
  {
    path: 'transactions/packing',
    loadChildren: () => import('./modules/transactions/pages/packing/packing.module').then( m => m.PackingPageModule)
  },
  {
    path: 'transactions/packing/packing-detail',
    loadChildren: () => import('./modules/transactions/pages/packing/packing-detail/detail/detail.module').then( m => m.DetailPageModule)
  },



  // others
  {
    path: 'others',
    loadChildren: () => import('./modules/others/pages/others/others.module').then(m => m.OthersPageModule)
  },
  // others-otp-configuration
  {
    path: 'others/otp-configuration',
    loadChildren: () => import('./modules/others/pages/otp-configuration/otp-configuration.module').then( m => m.OtpConfigurationPageModule)
  },
  // others-check-balance
  {
    path: 'others/check-balance',
    loadChildren: () => import('./modules/others/pages/check-balance/check-balance.module').then(m => m.CheckBalancePageModule)
  },
  // others-stock-count
  {
    path: 'others/stock-count',
    loadChildren: () => import('./modules/others/pages/stock-count/stock-count.module').then( m => m.StockCountPageModule)
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
    path: 'search-multi-dropdown',
    loadChildren: () => import('./shared/pages/search-multi-dropdown/search-multi-dropdown.module').then( m => m.SearchMultiDropdownPageModule)
  },
  {
    path: 'item-add-grid',
    loadChildren: () => import('./shared/pages/item-add-grid/item-add-grid.module').then(m => m.ItemAddGridPageModule)
  },
  {
    path: 'item-add-list',
    loadChildren: () => import('./shared/pages/item-add-list/item-add-list.module').then( m => m.ItemAddListPageModule)
  },
  {
    path: 'item-cart',
    loadChildren: () => import('./shared/pages/item-cart/item-cart.module').then(m => m.ItemCartPageModule)
  },
  {
    path: 'transaction-processing',
    loadChildren: () => import('./shared/pages/transaction-processing/transaction-processing.module').then(m => m.TransactionProcessingPageModule)
  },





];
@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      { 
        preloadingStrategy: PreloadAllModules, 
        relativeLinkResolution: 'legacy'
      })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
