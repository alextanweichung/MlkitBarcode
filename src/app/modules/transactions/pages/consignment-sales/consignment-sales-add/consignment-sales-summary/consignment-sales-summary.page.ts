import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ConsignmentSalesSummary } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';

@Component({
  selector: 'app-consignment-sales-summary',
  templateUrl: './consignment-sales-summary.page.html',
  styleUrls: ['./consignment-sales-summary.page.scss'],
})
export class ConsignmentSalesSummaryPage implements OnInit {

  objectSummary: ConsignmentSalesSummary;

  constructor(
    public objectService: ConsignmentSalesService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectSummary = this.objectService.summary;
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/consignment-sales');
  }

}
