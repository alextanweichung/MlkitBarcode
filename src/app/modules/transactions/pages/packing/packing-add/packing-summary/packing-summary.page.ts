import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GoodsPackingSummary } from 'src/app/modules/transactions/models/packing';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-packing-summary',
  templateUrl: './packing-summary.page.html',
  styleUrls: ['./packing-summary.page.scss'],
})
export class PackingSummaryPage implements OnInit {

  objectSummary: GoodsPackingSummary;

  constructor(
    private packingService: PackingService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectSummary = this.packingService.objectSummary;
    this.loadMasterList();
  }

  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.packingService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
    })
  }

  done() {
    this.packingService.resetVariables();
    this.navController.navigateRoot('/transactions/packing');
  }
}
