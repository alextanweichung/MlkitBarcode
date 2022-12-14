import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PickingSummary } from 'src/app/modules/transactions/models/picking';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-picking-summary',
  templateUrl: './picking-summary.page.html',
  styleUrls: ['./picking-summary.page.scss'],
})
export class PickingSummaryPage implements OnInit {

  pickingSummary: PickingSummary;

  constructor(
    private pickingService: PickingService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.pickingSummary = this.pickingService.objectSummary;
    this.loadMasterList();
  }

  customerMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.pickingService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
    })
  }

  done() {
    this.pickingService.resetVariables();
    this.navController.navigateRoot('/transactions/picking');
  }

}
