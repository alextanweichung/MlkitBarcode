import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConsignmentSalesList } from '../../models/consignment-sales';
import { GoodsPackingList } from '../../models/packing';
import { GoodsPickingList } from '../../models/picking';
import { QuotationList } from '../../models/quotation';
import { SalesOrderList } from '../../models/sales-order';

const transactionPageCode: string = 'MATR';
const mobileQuotationCode: string = 'MATRQU';
const mobileSalesOrderCode: string = 'MATRSO';
const mobilePickingCode: string = 'MATRPI';
const mobilePackingCode: string = 'MATRPA';
const mobileConsignmentSalesCode: string = 'MATRCS';
const mobileInventoryCountCode: string = 'MATRST';
const mobileInventoryLevelCode: string = 'MATRIL';
const mobilePosCashDeposit: string = 'MAMPCD';
const mobileTruckLoading: string = 'MAMTL';

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

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === transactionPageCode);
      if (pageItems) {
        this.showQuotation = pageItems.findIndex(r => r.title === mobileQuotationCode) > -1;
        this.showSalesOrder = pageItems.findIndex(r => r.title === mobileSalesOrderCode) > -1;
        this.showPicking = pageItems.findIndex(r => r.title === mobilePickingCode) > -1;
        this.showPacking = pageItems.findIndex(r => r.title === mobilePackingCode) > -1;
        this.showConsignmentSales = pageItems.findIndex(r => r.title === mobileConsignmentSalesCode) > -1;
        this.showStockCount = pageItems.findIndex(r => r.title === mobileInventoryCountCode) > -1;
        this.showInventoryLevel = pageItems.findIndex(r => r.title === mobileInventoryLevelCode) > -1;
        this.showCashDeposit = pageItems.findIndex(r => r.title === mobilePosCashDeposit) > -1;
        this.showTruckLoading = pageItems.findIndex(r => r.title === mobileTruckLoading) > -1;
      }
    })
  }

}
