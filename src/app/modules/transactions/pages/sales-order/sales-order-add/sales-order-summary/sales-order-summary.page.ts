import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SalesOrderSummary } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';

@Component({
  selector: 'app-sales-order-summary',
  templateUrl: './sales-order-summary.page.html',
  styleUrls: ['./sales-order-summary.page.scss'],
})
export class SalesOrderSummaryPage implements OnInit {

  salesOrderSummary: SalesOrderSummary;

  constructor(
    private salesOrderService: SalesOrderService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.salesOrderSummary = this.salesOrderService.salesOrderSummary;
  }

  addMore() {
    this.navController.navigateRoot('/transactions/sales-order/sales-order-header');
  }

  done() {
    this.salesOrderService.resetVariables();
    this.navController.navigateRoot('/transactions/sales-order');
  }

}
