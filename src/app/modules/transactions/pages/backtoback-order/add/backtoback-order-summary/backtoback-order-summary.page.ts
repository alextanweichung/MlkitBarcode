import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BackToBackOrderRoot } from 'src/app/modules/transactions/models/backtoback-order';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';

@Component({
  selector: 'app-backtoback-order-summary',
  templateUrl: './backtoback-order-summary.page.html',
  styleUrls: ['./backtoback-order-summary.page.scss'],
})
export class BacktobackOrderSummaryPage implements OnInit {

  object: BackToBackOrderRoot;

  constructor(
    public objectService: BackToBackOrderService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.object = this.objectService.object;
  }

  addMore() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/backtoback-order/backtoback-order-header');
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/backtoback-order');
  }

}
