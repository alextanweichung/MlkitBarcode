import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ConsignmentSalesSummary } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-consignment-sales-summary',
  templateUrl: './consignment-sales-summary.page.html',
  styleUrls: ['./consignment-sales-summary.page.scss'],
})
export class ConsignmentSalesSummaryPage implements OnInit {

  objectSummary: ConsignmentSalesSummary;

  constructor(
    private consignmentSalesService: ConsignmentSalesService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectSummary = this.consignmentSalesService.summary;
    this.loadMasterList();
  }

  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.consignmentSalesService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  done() {
    this.consignmentSalesService.resetVariables();
    this.navController.navigateRoot('/transactions/consignment-sales');
  }

}
