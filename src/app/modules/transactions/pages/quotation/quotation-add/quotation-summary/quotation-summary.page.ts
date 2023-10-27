import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';

@Component({
  selector: 'app-quotation-summary',
  templateUrl: './quotation-summary.page.html',
  styleUrls: ['./quotation-summary.page.scss'],
})
export class QuotationSummaryPage implements OnInit {

  constructor(
    public objectService: QuotationService,
    private authService: AuthService,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    
  }

  /* #region show variaton dialog */

  // selectedItem: TransactionDetail;
  showDetails(item: TransactionDetail) {
    if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
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
    this.navController.navigateRoot("/transactions/quotation/quotation-header");
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot("/transactions/quotation");
  }

}
