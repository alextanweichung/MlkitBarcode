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
    public objectService: PackingService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectSummary = this.objectService.objectSummary;
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/packing');
  }

}
