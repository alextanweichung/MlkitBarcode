import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PickingList } from '../../models/picking';
import { QuotationList } from '../../models/quotation';
import { SalesOrderList } from '../../models/sales-order';
import { PickingService } from '../../services/picking.service';
import { QuotationService } from '../../services/quotation.service';
import { SalesOrderService } from '../../services/sales-order.service';

const pageCode: string = 'MATR';
const quotationCode: string = 'MATRQU';
const salesOrderCode: string = 'MATRSO';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {

  showQuotation: boolean = false;
  quotation_loaded: boolean = false;
  quotations: QuotationList[] = [];

  showSalesOrder: boolean = false;
  sales_order_loaded: boolean = false;
  salesOrders: SalesOrderList[] = [];

  picking_loaded: boolean = false;
  pickings: PickingList[] = [];

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private quotationService: QuotationService,
    private salesOrderService: SalesOrderService,
    private pickingService: PickingService
  ) { }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === pageCode);
      if (pageItems) {
        this.showQuotation = pageItems.findIndex(r => r.title === quotationCode) > -1;
        this.showSalesOrder = pageItems.findIndex(r => r.title === salesOrderCode) > -1;
      }
    })
    this.loadAllRecentList();
  }

  handleRefresh(event) {
    setTimeout(() => {
      this.loadAllRecentList();
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  };

  loadAllRecentList() {
    // quotation
    this.loadRecentQuotation();

    // sales order
    this.loadRecentSalesOrder();

    // picking
    this.loadRecentPicking();
  }

  /* #region  quotation */

  loadRecentQuotation() {
    this.quotationService.getRecentQuotationList().subscribe(response => {
      this.quotations = response;
      if (this.quotations.length > 0) {
        this.quotation_loaded = true;
      }
    }, error => {
      console.log(error);
    })
  }

  async goToQuotationDetail(quotationId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        quotationId: quotationId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/transactions/quotation/quotation-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  quotation */

  loadRecentSalesOrder() {
    this.salesOrderService.getRecentSalesOrderList().subscribe(response => {
      this.salesOrders = response;
      if (this.salesOrders.length > 0) {
        this.sales_order_loaded = true;
      }
    }, error => {
      console.log(error);
    })
  }

  async goToSalesOrderDetail(salesOrderId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        salesOrderId: salesOrderId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/transactions/sales-order/sales-order-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  picking */

  loadRecentPicking() {
    // this.pickingService.getRecentPickingList().subscribe(response => {
    //   this.pickings = response;
    //   if (this.pickings.length > 0) {
    //     this.picking_loaded = true;
    //   }
    // }, error => {
    //   console.log(error);
    // })
  }

  async goToPickingDetail(pickingId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        pickingId: pickingId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/transactions/picking/picking-detail', navigationExtras);
  }

  /* #endregion */

}
