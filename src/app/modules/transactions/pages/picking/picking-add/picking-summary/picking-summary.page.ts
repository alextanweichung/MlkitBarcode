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
    public objectService: PickingService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.pickingSummary = this.objectService.objectSummary;
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/picking');
  }

}
