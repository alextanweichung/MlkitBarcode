import { Component, OnInit } from '@angular/core';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';

@Component({
  selector: 'app-backtoback-order-summary',
  templateUrl: './backtoback-order-summary.page.html',
  styleUrls: ['./backtoback-order-summary.page.scss'],
})
export class BacktobackOrderSummaryPage implements OnInit, ViewWillEnter {

  constructor(
    private authService: AuthService,
    public objectService: BackToBackOrderService,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ionViewWillEnter(): void {
    
  }

  ngOnInit() {
    
  }

  /* #region show variaton dialog */

  selectedItem: TransactionDetail;
  showDetails(item: TransactionDetail) {
    if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
      this.objectService.objectSummary.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
    }
  }

  filter(details: InnerVariationDetail[]) {
    try {
      return details.filter(r => r.qtyRequest > 0);
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  addMore() {
    this.objectService.resetVariables();
    this.navController.navigateRoot("/transactions/backtoback-order/backtoback-order-header");
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot("/transactions/backtoback-order");
  }

}
