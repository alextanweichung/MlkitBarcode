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
    path: 'forget-password',
    loadChildren: () => import('./modules/public/forget-password/forget-password.module').then( m => m.ForgetPasswordPageModule)
  },





  // dashboard  
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },




  // management
  {
    path: 'managements',
    loadChildren: () => import('./modules/managements/pages/management/management.module').then(m => m.ManagementPageModule)
  },
  // management-quotation
  {
    path: 'managements/quotation-reviews',
    loadChildren: () => import('./modules/managements/pages/quotation-reviews/quotation-reviews.module').then(m => m.QuotationReviewsPageModule)
  },
  {
    path: 'managements/quotation-approvals',
    loadChildren: () => import('./modules/managements/pages/quotation-approvals/quotation-approvals.module').then(m => m.QuotationApprovalsPageModule)
  },
  // management-sales-order
  {
    path: 'managements/sales-order-reviews',
    loadChildren: () => import('./modules/managements/pages/sales-order-reviews/sales-order-reviews.module').then(m => m.SalesOrderReviewsPageModule)
  },
  {
    path: 'managements/sales-order-approvals',
    loadChildren: () => import('./modules/managements/pages/sales-order-approvals/sales-order-approvals.module').then(m => m.SalesOrderApprovalsPageModule)
  },
  // management-purchase-order  
  {
    path: 'managements/purchase-order-reviews',
    loadChildren: () => import('./modules/managements/pages/purchase-order-reviews/purchase-order-reviews.module').then(m => m.PurchaseOrderReviewsPageModule)
  },
  {
    path: 'managements/purchase-order-approvals',
    loadChildren: () => import('./modules/managements/pages/purchase-order-approvals/purchase-order-approvals.module').then(m => m.PurchaseOrderApprovalsPageModule)
  },
  // management-otp-configuration
  {
    path: 'managements/otp-configuration',
    loadChildren: () => import('./modules/managements/pages/otp-configuration/otp-configuration.module').then(m => m.OtpConfigurationPageModule)
  },
  {
    path: 'managements/otp-config-list',
    loadChildren: () => import('./modules/managements/pages/otp-configuration/otp-config-list/otp-config-list.module').then(m => m.OtpConfigListPageModule)
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
    loadChildren: () => import('./modules/transactions/pages/quotation/quotation-detail/quotation-detail.module').then(m => m.QuotationDetailPageModule)
  },
  // transaction-sales-order
  {
    path: 'transactions/sales-order',
    loadChildren: () => import('./modules/transactions/pages/sales-order/sales-order.module').then(m => m.SalesOrderPageModule)
  },
  {
    path: 'transactions/sales-order/sales-order-detail',
    loadChildren: () => import('./modules/transactions/pages/sales-order/sales-order-detail/sales-order-detail.module').then(m => m.SalesOrderDetailPageModule)
  },
  // transactions-purchase-order
  {
    path: 'transactions/purchase-order/purchase-order-detail',
    loadChildren: () => import('./modules/transactions/pages/purchase-order/purchase-order-detail/purchase-order-detail.module').then(m => m.PurchaseOrderDetailPageModule)
  },
  // transaction-picking  
  {
    path: 'transactions/picking',
    loadChildren: () => import('./modules/transactions/pages/picking/picking.module').then(m => m.PickingPageModule)
  },
  {
    path: 'transactions/picking/picking-detail',
    loadChildren: () => import('./modules/transactions/pages/picking/picking-detail/picking-detail.module').then(m => m.PickingDetailPageModule)
  },
  // transaction-packing
  {
    path: 'transactions/packing',
    loadChildren: () => import('./modules/transactions/pages/packing/packing.module').then(m => m.PackingPageModule)
  },
  {
    path: 'transactions/packing/packing-detail',
    loadChildren: () => import('./modules/transactions/pages/packing/packing-detail/packing-detail.module').then(m => m.PackingDetailPageModule)
  },
  // transaction-consignment-sales
  {
    path: 'transactions/consignment-sales',
    loadChildren: () => import('./modules/transactions/pages/consignment-sales/consignment-sales.module').then(m => m.ConsignmentSalesPageModule)
  },
  {
    path: 'transactions/consignment-sales/consignment-sales-detail',
    loadChildren: () => import('./modules/transactions/pages/consignment-sales/consignment-sales-detail/consignment-sales-detail.module').then(m => m.ConsignmentSalesDetailPageModule)
  },
  // transaction-stock-count
  {
    path: 'transactions/stock-count',
    loadChildren: () => import('./modules/transactions/pages/stock-count/stock-count.module').then(m => m.StockCountPageModule)
  },
  {
    path: 'transactions/stock-count/stock-count-detail',
    loadChildren: () => import('./modules/transactions/pages/stock-count/stock-count-detail/stock-count-detail.module').then(m => m.StockCountDetailPageModule)
  },
  // transaction-check-balance
  {
    path: 'transactions/check-balance',
    loadChildren: () => import('./modules/transactions/pages/check-balance/check-balance.module').then(m => m.CheckBalancePageModule)
  },
  // transaction-cash-deposit
  {
    path: 'transactions/cash-deposit',
    loadChildren: () => import('./modules/transactions/pages/cash-deposit/cash-deposit.module').then(m => m.CashDepositPageModule)
  },
  {
    path: 'transactions/truck-loading',
    loadChildren: () => import('./modules/transactions/pages/truck-loading/truck-loading.module').then(m => m.TruckLoadingPageModule)
  },
  {
    path: 'transactions/inter-transfer',
    loadChildren: () => import('./modules/transactions/pages/inter-transfer/inter-transfer.module').then( m => m.InterTransferPageModule)
  },



  // reports
  {
    path: 'reports',
    loadChildren: () => import('./modules/reports/pages/reports/reports.module').then(m => m.ReportsPageModule)
  },
  {
    path: 'reports/debtor-latest-outstanding',
    loadChildren: () => import('./modules/reports/pages/reports/debtor-latest-outstanding/debtor-latest-outstanding.module').then(m => m.DebtorLatestOutstandingPageModule)
  },
  {
    path: 'reports/rp-so-listing',
    loadChildren: () => import('./modules/reports/pages/reports/rp-so-listing/rp-so-listing.module').then(m => m.RpSoListingPageModule)
  },
  {
    path: 'reports/rp-sa-performance-listing',
    loadChildren: () => import('./modules/reports/pages/reports/rp-sa-performance-listing/rp-sa-performance-listing.module').then(m => m.RpSaPerformanceListingPageModule)
  },
  {
    path: 'reports/rp-sales-customer',
    loadChildren: () => import('./modules/reports/pages/reports/rp-sales-customer/rp-sales-customer.module').then( m => m.RpSalesCustomerPageModule)
  },
  {
    path: 'reports/rp-sa-perf-all',
    loadChildren: () => import('./rp-sa-perf-all/rp-sa-perf-all.module').then( m => m.RpSaPerfAllPageModule)
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
    loadChildren: () => import('./shared/pages/search-multi-dropdown/search-multi-dropdown.module').then(m => m.SearchMultiDropdownPageModule)
  },
  {
    path: 'item-add-grid',
    loadChildren: () => import('./shared/pages/general-sales-grid/general-sales-grid.module').then(m => m.GeneralSalesGridPageModule)
  },
  {
    path: 'item-add-list',
    loadChildren: () => import('./shared/pages/general-sales-list/general-sales-list.module').then(m => m.GeneralSalesListPageModule)
  },
  {
    path: 'item-cart',
    loadChildren: () => import('./shared/pages/item-cart/item-cart.module').then(m => m.ItemCartPageModule)
  },
  {
    path: 'transaction-processing',
    loadChildren: () => import('./shared/pages/transaction-processing/transaction-processing.module').then(m => m.TransactionProcessingPageModule)
  },
  {
    path: 'calendar-input',
    loadChildren: () => import('./shared/pages/calendar-input/calendar-input.module').then(m => m.CalendarInputPageModule)
  },
  {
    path: 'barcode-scan-input',
    loadChildren: () => import('./shared/pages/barcode-scan-input/barcode-scan-input.module').then(m => m.BarcodeScanInputPageModule)
  },
  {
    path: 'item-add-list-flat',
    loadChildren: () => import('./shared/pages/item-add-list-flat/item-add-list-flat.module').then(m => m.ItemAddListFlatPageModule)
  },
  {
    path: 'item-view-list-flat',
    loadChildren: () => import('./shared/pages/item-view-list-flat/item-view-list-flat.module').then(m => m.ItemViewListFlatPageModule)
  },
  {
    path: 'item-catalog',
    loadChildren: () => import('./shared/pages/item-catalog/item-catalog.module').then(m => m.ItemCatalogPageModule)
  },
  {
    path: 'item-catalog-without-price',
    loadChildren: () => import('./shared/pages/item-catalog-without-price/item-catalog-without-price.module').then( m => m.ItemCatalogWithoutPricePageModule)
  },
  {
    path: 'camera-scan-input',
    loadChildren: () => import('./shared/pages/camera-scan-input/camera-scan-input.module').then(m => m.CameraScanInputPageModule)
  },
  {
    path: 'item-code-input-offline',
    loadChildren: () => import('./shared/pages/item-code-input-offline/item-code-input-offline.module').then(m => m.ItemCodeInputOfflinePageModule)
  },




];
@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
    preloadingStrategy: PreloadAllModules
})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
