import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { moduleCode, trxAppCode } from 'src/app/shared/models/acl-const';
import { ConsignmentSalesList } from '../../models/consignment-sales';
import { GoodsPackingList } from '../../models/packing';
import { GoodsPickingList } from '../../models/picking';
import { QuotationList } from '../../models/quotation';
import { SalesOrderList } from '../../models/sales-order';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {

  showQuotation: boolean = false;
  quotations: QuotationList[] = [];

  showSalesOrder: boolean = false;
  salesOrders: SalesOrderList[] = [];

  showPicking: boolean = false;
  pickings: GoodsPickingList[] = [];

  showPacking: boolean = false;
  packings: GoodsPackingList[] = [];

  showConsignmentSales: boolean = false;
  consignment_sales: ConsignmentSalesList[] = [];

  showStockCount: boolean = false;
  showInventoryLevel: boolean = false;
  showCashDeposit: boolean = false;
  showTruckLoading: boolean = false;
  showInterTransfer: boolean = false;
  showTransferConfirmation: boolean = false;
  showDebtorApplication: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    try {
      this.authService.menuModel$.subscribe(obj => {
        let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.transaction);
        if (pageItems) {
          this.showQuotation = pageItems.findIndex(r => r.title === trxAppCode.mobileQuotation) > -1;
          this.showSalesOrder = pageItems.findIndex(r => r.title === trxAppCode.mobileSalesOrder) > -1;
          this.showPicking = pageItems.findIndex(r => r.title === trxAppCode.mobilePicking) > -1;
          this.showPacking = pageItems.findIndex(r => r.title === trxAppCode.mobilePacking) > -1;
          this.showConsignmentSales = pageItems.findIndex(r => r.title === trxAppCode.mobileConsignment) > -1;
          this.showStockCount = pageItems.findIndex(r => r.title === trxAppCode.mobileStockCount) > -1;
          this.showInventoryLevel = pageItems.findIndex(r => r.title === trxAppCode.mobileInventoryLevel) > -1;
          this.showCashDeposit = pageItems.findIndex(r => r.title === trxAppCode.mobileCashDepo) > -1;
          this.showTruckLoading = pageItems.findIndex(r => r.title === trxAppCode.mobileTruckLoading) > -1;
          this.showInterTransfer = pageItems.findIndex(r => r.title === trxAppCode.mobileInterTransfer) > -1;
          this.showTransferConfirmation = pageItems.findIndex(r => r.title === trxAppCode.mobileTransferConfirmation) > -1;
          this.showDebtorApplication = pageItems.findIndex(r => r.title === trxAppCode.mobileDebtorApp) > -1;
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

}
