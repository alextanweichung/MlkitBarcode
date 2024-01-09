import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
      loadChildren: () => import('./modules/public/forget-password/forget-password.module').then(m => m.ForgetPasswordPageModule)
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
   // management-b2bo
   {
      path: 'managements/b2bo-reviews',
      loadChildren: () => import('./modules/managements/pages/b2bo-reviews/b2bo-reviews.module').then(m => m.B2boReviewsPageModule)
   },
   {
      path: 'managements/b2bo-approvals',
      loadChildren: () => import('./modules/managements/pages/b2bo-approvals/b2bo-approvals.module').then(m => m.B2boApprovalsPageModule)
   },
   // management-purchase-req
   {
      path: 'managements/purchase-req-reviews',
      loadChildren: () => import('./modules/managements/pages/purchase-req-reviews/purchase-req-reviews.module').then(m => m.PurchaseReqReviewsPageModule)
   },
   {
      path: 'managements/purchase-req-approvals',
      loadChildren: () => import('./modules/managements/pages/purchase-req-approvals/purchase-req-approvals.module').then(m => m.PurchaseReqApprovalsPageModule)
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
   {
      path: 'managements/non-trade-purchase-req-reviews',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-req-reviews/non-trade-purchase-req-reviews.module').then(m => m.NonTradePurchaseReqReviewsPageModule)
   },
   {
      path: 'managements/non-trade-purchase-req-approvals',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-req-approvals/non-trade-purchase-req-approvals.module').then(m => m.NonTradePurchaseReqApprovalsPageModule)
   },
   {
      path: 'managements/non-trade-purchase-order-reviews',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-order-reviews/non-trade-purchase-order-reviews.module').then(m => m.NonTradePurchaseOrderReviewsPageModule)
   },
   {
      path: 'managements/non-trade-purchase-order-approvals',
      loadChildren: () => import('./modules/managements/pages/non-trade-purchase-order-approvals/non-trade-purchase-order-approvals.module').then(m => m.NonTradePurchaseOrderApprovalsPageModule)
   },
   // management-pricing
   {
      path: 'managements/pricing-approvals',
      loadChildren: () => import('./modules/managements/pages/pricing-approvals/pricing-approvals.module').then(m => m.PricingApprovalsPageModule)
   },
   // management-b2bopricing
   {
      path: 'managements/b2bopricing-approvals',
      loadChildren: () => import('./modules/managements/pages/b2bopricing-approvals/b2bopricing-approvals.module').then(m => m.B2bopricingApprovalsPageModule)
   },
   {
      path: 'managements/refund-approvals',
      loadChildren: () => import('./modules/managements/pages/refund-approvals/refund-approvals.module').then(m => m.RefundApprovalsPageModule)
   },
   {
      path: 'managements/exchange-approvals',
      loadChildren: () => import('./modules/managements/pages/exchange-approvals/exchange-approvals.module').then(m => m.ExchangeApprovalsPageModule)
   },
   {
      path: 'managements/recall-deposit-approvals',
      loadChildren: () => import('./modules/managements/pages/recall-deposit-approvals/recall-deposit-approvals.module').then(m => m.RecallDepositApprovalsPageModule)
   },
   //management-branch-receiving
   {
      path: 'managements/branch-receiving-reviews',
      loadChildren: () => import('./modules/managements/pages/branch-receiving-reviews/branch-receiving-reviews.module').then(m => m.BranchReceivingReviewsPageModule)
   },
   {
      path: 'managements/branch-receiving-approvals',
      loadChildren: () => import('./modules/managements/pages/branch-receiving-approvals/branch-receiving-approvals.module').then(m => m.BranchReceivingApprovalsPageModule)
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
   // transaction-backtoback-order
   {
      path: 'transactions/backtoback-order',
      loadChildren: () => import('./modules/transactions/pages/backtoback-order/backtoback-order.module').then(m => m.BackToBackOrderPageModule)
   },
   // transaction-purchase-req
   {
      path: 'transactions/purchase-req/purchase-req-detail',
      loadChildren: () => import('./modules/transactions/pages/purchase-req/purchase-req-detail/purchase-req-detail.module').then(m => m.PurchaseReqDetailPageModule)
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
   // transaction-inventory-level-trading
   {
      path: 'transactions/inventory-level-trading',
      loadChildren: () => import('./modules/transactions/pages/inventory-level-trading/inventory-level-trading.module').then(m => m.InventoryLevelTradingPageModule)
   },
   // transaction-inventory-level-retail
   {
      path: 'transactions/inventory-level-retail',
      loadChildren: () => import('./modules/transactions/pages/inventory-level-retail/inventory-level-retail.module').then(m => m.InventoryLevelRetailPageModule)
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
      loadChildren: () => import('./modules/transactions/pages/inter-transfer/inter-transfer.module').then(m => m.InterTransferPageModule)
   },
   {
      path: 'transactions/transfer-confirmation',
      loadChildren: () => import('./modules/transactions/pages/transfer-confirmation/transfer-confirmation.module').then(m => m.TransferConfirmationPageModule)
   },
   {
      path: 'transactions/debtor-application',
      loadChildren: () => import('./modules/transactions/pages/debtor-application/debtor-application.module').then(m => m.DebtorApplicationPageModule)
   },
   {
      path: 'transactions/stock-replenish',
      loadChildren: () => import('./modules/transactions/pages/stock-replenish/stock-replenish.module').then(m => m.StockReplenishPageModule)
   },
   {
      path: 'transactions/consignment-count',
      loadChildren: () => import('./modules/transactions/pages/consignment-count/consignment-count.module').then(m => m.ConsignmentCountPageModule)
   },
   {
      path: 'transactions/inbound-scan',
      loadChildren: () => import('./modules/transactions/pages/inbound-scan/inbound-scan.module').then(m => m.InboundScanPageModule)
   },
   {
      path: 'transactions/stock-reorder',
      loadChildren: () => import('./modules/transactions/pages/stock-reorder/stock-reorder.module').then(m => m.StockReorderPageModule)
   },
   {
      path: 'transactions/transfer-out',
      loadChildren: () => import('./modules/transactions/pages/transfer-out/transfer-out.module').then(m => m.TransferOutPageModule)
   },
   {
      path: 'transactions/transfer-in',
      loadChildren: () => import('./modules/transactions/pages/transfer-in/transfer-in.module').then(m => m.TransferInPageModule)
   },
   {
      path: 'transactions/transfer-in-scanning',
      loadChildren: () => import('./modules/transactions/pages/transfer-in-scanning/transfer-in-scanning.module').then(m => m.TransferInScanningPageModule)
   },
   {
      path: 'transactions/non-trade-purchase-order/non-trade-purchase-order-detail',
      loadChildren: () => import('./modules/transactions/pages/non-trade-purchase-order/non-trade-purchase-order-detail/non-trade-purchase-order-detail.module').then(m => m.NonTradePurchaseOrderDetailPageModule)
   },
   {
      path: 'transactions/non-trade-purchase-req/non-trade-purchase-req-detail',
      loadChildren: () => import('./modules/transactions/pages/non-trade-purchase-req/non-trade-purchase-req-detail/non-trade-purchase-req-detail.module').then(m => m.NonTradePurchaseReqDetailPageModule)
   },
   {
      path: 'transactions/pos-bill/pos-bill-detail',
      loadChildren: () => import('./modules/transactions/pages/pos-bill/pos-bill-detail/pos-bill-detail.module').then(m => m.PosBillDetailPageModule)
   },
   {
      path: 'transactions/pos-sales-deposit/pos-sales-deposit-detail',
      loadChildren: () => import('./modules/transactions/pages/pos-sales-deposit/pos-sales-deposit-detail/pos-sales-deposit-detail.module').then(m => m.PosSalesDepositDetailPageModule)
   },
   {
      path: 'transactions/pallet-assembly',
      loadChildren: () => import('./modules/transactions/pages/pallet-assembly/pallet-assembly.module').then(m => m.PalletAssemblyPageModule)
   },
   {
      path: 'transactions/transfer-bin',
      loadChildren: () => import('./modules/transactions/pages/transfer-bin/transfer-bin.module').then(m => m.TransferBinPageModule)
   },
   // transactions-branch-receiving
   {
      path: 'transactions/branch-receiving/branch-receiving-detail',
      loadChildren: () => import('./modules/transactions/pages/branch-receiving/branch-receiving-detail/branch-receiving-detail.module').then(m => m.BranchReceivingDetailPageModule)
   },
   {
      path: 'transactions/bin-count',
      loadChildren: () => import('./modules/transactions/pages/bin-count/bin-count.module').then(m => m.BinCountPageModule)
   },
   //transactions-do-acknowledgement
   {
      path: 'transactions/do-acknowledgement',
      loadChildren: () => import('./modules/transactions/pages/do-acknowledgement/do-acknowledgement.module').then(m => m.DoAcknowledgementPageModule)
   },
   {
      path: 'transactions/carton-truck-loading',
      loadChildren: () => import('./modules/transactions/pages/carton-truck-loading/carton-truck-loading.module').then(m => m.CartonTruckLoadingPageModule)
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
      path: 'reports/rp-sales-customer',
      loadChildren: () => import('./modules/reports/pages/reports/rp-sales-customer/rp-sales-customer.module').then(m => m.RpSalesCustomerPageModule)
   },
   {
      path: 'reports/rp-sales-performance',
      loadChildren: () => import('./modules/reports/pages/reports/rp-sales-performance/rp-sales-performance.module').then(m => m.RpSalesPerformancePageModule)
   },
   {
      path: 'reports/rp-check-qoh',
      loadChildren: () => import('./modules/reports/pages/reports/rp-check-qoh/rp-check-qoh.module').then(m => m.RpCheckQohPageModule)
   },
   {
      path: 'reports/rp-check-cn',
      loadChildren: () => import('./modules/reports/pages/reports/rp-check-cn/rp-check-cn.module').then(m => m.RpCheckCnPageModule)
   },
   {
      path: 'reports/transaction-inquiry',
      loadChildren: () => import('./modules/reports/pages/transaction-inquiry/transaction-inquiry.module').then(m => m.TransactionInquiryPageModule)
   },
   {
      path: 'reports/sales-analysis',
      loadChildren: () => import('./modules/reports/pages/sales-analysis/sales-analysis.module').then(m => m.SalesAnalysisPageModule)
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
      path: 'item-catalog',
      loadChildren: () => import('./shared/pages/item-catalog/item-catalog.module').then(m => m.ItemCatalogPageModule)
   },
   {
      path: 'item-catalog-without-price',
      loadChildren: () => import('./shared/pages/item-catalog-without-price/item-catalog-without-price.module').then(m => m.ItemCatalogWithoutPricePageModule)
   },
   {
      path: 'camera-scan-input',
      loadChildren: () => import('./shared/pages/camera-scan-input/camera-scan-input.module').then(m => m.CameraScanInputPageModule)
   },
   {
      path: 'item-code-input-offline',
      loadChildren: () => import('./shared/pages/item-code-input-offline/item-code-input-offline.module').then(m => m.ItemCodeInputOfflinePageModule)
   },
   {
      path: 'pos-approval-processing',
      loadChildren: () => import('./shared/pages/pos-approval-processing/pos-approval-processing.module').then(m => m.PosApprovalProcessingPageModule)
   },
   {
      path: 'general-scan-input',
      loadChildren: () => import('./shared/pages/general-scan-input/general-scan-input.module').then(m => m.GeneralScanInputPageModule)
   },
   {
      path: 'do-acknowledgement',
      loadChildren: () => import('./modules/transactions/pages/do-acknowledgement/do-acknowledgement.module').then(m => m.DoAcknowledgementPageModule)
   },
   {
      path: 'item-sales-history',
      loadChildren: () => import('./shared/pages/item-sales-history/item-sales-history.module').then(m => m.ItemSalesHistoryPageModule)
   },
   {
      path: 'sales-cart',
      loadChildren: () => import('./shared/pages/sales-cart/sales-cart.module').then(m => m.SalesCartPageModule)
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
