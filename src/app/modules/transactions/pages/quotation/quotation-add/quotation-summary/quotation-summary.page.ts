import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QuotationRoot } from 'src/app/modules/transactions/models/quotation';
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

  object: QuotationRoot;

  constructor(
    private authService: AuthService,
    public objectService: QuotationService,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadModuleControl
    this.object = this.objectService.object;
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    try {
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading module control', '', 'top', 'danger', 1000);
    }
  }

  /* #region show variaton dialog */

  selectedItem: TransactionDetail;
  showDetails(item: TransactionDetail) {
    if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
      this.object.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
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
    this.navController.navigateRoot('/transactions/quotation/quotation-header');
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/quotation');
  }

}
