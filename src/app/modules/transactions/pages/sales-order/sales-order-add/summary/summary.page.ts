import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SalesOrderSummary } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {

  salesOrderSummary: SalesOrderSummary;

  constructor(
    private salesOrderService: SalesOrderService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.salesOrderSummary = this.salesOrderService.salesOrderSummary;
    if (this.salesOrderSummary) {
      this.navController.navigateRoot('/transactions/sales-order');
    }
    this.loadMasterList();
  }

  customerMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.salesOrderService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
    })
  }

  done() {
    this.salesOrderService.resetVariables();
    this.navController.navigateRoot('/transactions/sales-order');
  }

}
