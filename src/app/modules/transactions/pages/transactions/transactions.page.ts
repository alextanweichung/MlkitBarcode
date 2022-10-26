import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { QuotationList } from '../../models/quotation';
import { SalesOrderList } from '../../models/sales-order';
import { QuotationService } from '../../services/quotation.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {

  quotation_loaded: boolean = false;
  quotations: QuotationList[] = [];

  sales_order_loaded: boolean = false;
  salesOrders: SalesOrderList[] = [];

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private navController: NavController,
    private quotationService: QuotationService,
    private salesOrderService: SalesOrderService
  ) { }

  ngOnInit() {
    this.loadAllRecentList();
  }

  loadAllRecentList() {
    // quotation
    this.quotationService.getRecentQuotationList().subscribe(response => {
      this.quotations = response;
      if (this.quotations.length > 0) {
        this.quotation_loaded = true;
      }
    }, error => {
      console.log(error);
    })

    // sales order
    this.salesOrderService.getRecentSalesOrderList().subscribe(response => {
      this.salesOrders = response;
      if (this.salesOrders.length > 0) {
        this.sales_order_loaded = true;
      }
    }, error => {
      console.log(error);
    })
  }

  async filter() {
    const modal = await this.modalController.create({
      component: FilterPage,
      canDismiss: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();

    let { data } = await modal.onWillDismiss();

    if (data) {
      // this.objectService.getSalesOrderList().subscribe(response => {
      //   this.sales_order_loaded = true;
      // }, error => {
      //   console.log(error);
      // })
    }
  }

  /* #region  quotation */

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

}
