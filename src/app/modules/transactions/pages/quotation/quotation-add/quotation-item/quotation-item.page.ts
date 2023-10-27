import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ItemCatalogPage } from 'src/app/shared/pages/item-catalog/item-catalog.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-quotation-item',
  templateUrl: './quotation-item.page.html',
  styleUrls: ['./quotation-item.page.scss'],
  providers: [DatePipe, SearchItemService, { provide: 'apiObject', useValue: 'mobileQuotation' }]
})
export class QuotationItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

  @ViewChild("itemCatalog", { static: false }) itemCatalog: ItemCatalogPage;

  constructor(
    private authService: AuthService,
    public objectService: QuotationService,
    private navController: NavController,
    private commonService: CommonService,
    private toastService: ToastService,
    private actionSheetController: ActionSheetController
  ) { }

  ionViewWillEnter(): void {
    try {
      this.objectService.loadRequiredMaster();
      if (!this.objectService.objectHeader || this.objectService.objectHeader === undefined || this.objectService.objectHeader === null) {
        this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
        this.navController.navigateBack("/transactions/quotation/quotation-header");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async ionViewDidEnter(): Promise<void> {
    await this.itemCatalog.setFocus();
  }

  ngOnInit() {

  }

  async onItemAdded(event: TransactionDetail) {
    try {
      let trxLine = JSON.parse(JSON.stringify(event));
      trxLine = this.assignTrxItemToDataLine(trxLine);
      if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
        await this.computeUnitPriceExTax(trxLine);
      } else {
        await this.computeUnitPrice(trxLine);
      }
      await this.objectService.objectDetail.unshift(trxLine);
      await this.computeAllAmount(this.objectService.objectDetail[0]);
      await this.assignSequence();
      this.toastService.presentToast("", "Item added", "top", "success", 1000);
    } catch (e) {
      console.error(e);
    }
  }

  assignSequence() {
    let index = 0;
    this.objectService.objectDetail.forEach(r => {
      r.sequence = index;
      index++;
    })
  }

  /* #region  toggle show image */

  showImage: boolean = false;
  toggleShowImage() {
    this.showImage = !this.showImage;
  }
  
  /* #endregion */

  /* #region  tax handle here */

  disablePromotionCheckBox: boolean = false;
  async computeAllAmount(trxLine: TransactionDetail) {
    try {
      await this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  getVariationSum(trxLine: TransactionDetail) {
    try {
      if (trxLine.variationTypeCode === "1" || trxLine.variationTypeCode === "2") {
        trxLine.qtyRequest = trxLine.variationDetails.flatMap(r => r.details).flatMap(r => r.qtyRequest).filter(r => r > 0).reduce((a, c) => Number(a) + Number(c));
      }
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPriceExTax(trxLine: TransactionDetail) {
    try {
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isHomeCurrency?this.objectService.precisionSalesUnitPrice.localMax:this.objectService.precisionSalesUnitPrice.foreignMax);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    try {
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isHomeCurrency?this.objectService.precisionSalesUnitPrice.localMax:this.objectService.precisionSalesUnitPrice.foreignMax);
      this.computeDiscTaxAmount(trxLine);      
    } catch (e) {
      console.error(e);
    }
  }

  async computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      await this.getVariationSum(trxLine);
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency?this.objectService.precisionSales.localMax:this.objectService.precisionSales.foreignMax);
    } catch (e) {
      console.error(e);
    }
  }

  assignTrxItemToDataLine(trxLine: TransactionDetail) {
    try {
      trxLine.lineId = 0;
      trxLine.headerId = this.objectService.objectHeader.quotationId;
      if (this.objectService.systemWideActivateTaxControl) {
        if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
          trxLine.unitPrice = trxLine.itemPricing.unitPrice;
          trxLine.unitPriceExTax = this.commonService.computeAmtExclTax(trxLine.itemPricing.unitPrice, trxLine.taxPct);
        } else {
          trxLine.unitPrice = this.commonService.computeAmtInclTax(trxLine.itemPricing.unitPrice, trxLine.taxPct);
          trxLine.unitPriceExTax = trxLine.itemPricing.unitPrice;
        }
      } else {
        trxLine.unitPrice = trxLine.itemPricing.unitPrice;
        trxLine.unitPriceExTax = trxLine.itemPricing.unitPrice;
      }
      trxLine.discountGroupCode = trxLine.itemPricing.discountGroupCode;
      trxLine.discountExpression = trxLine.itemPricing.discountExpression;
      trxLine.unitPrice = this.commonService.roundToPrecision(trxLine.unitPrice, this.objectService.objectHeader.isHomeCurrency?this.objectService.precisionSalesUnitPrice.localMax:this.objectService.precisionSalesUnitPrice.foreignMax);
      trxLine.unitPriceExTax = this.commonService.roundToPrecision(trxLine.unitPriceExTax, this.objectService.objectHeader.isHomeCurrency?this.objectService.precisionSalesUnitPrice.localMax:this.objectService.precisionSalesUnitPrice.foreignMax);
      
      if (this.objectService.salesActivatePromotionEngine) {
        trxLine.uuid = uuidv4();
        let discPct = Number(trxLine.discountExpression?.replace("%", ""));
        if (this.objectService.objectHeader.isItemPriceTaxInclusive) {
          trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPrice * ((100 - discPct) / 100), this.objectService.objectHeader.isHomeCurrency?this.objectService.precisionSales.localMax:this.objectService.precisionSales.foreignMax) : trxLine.unitPrice;
        } else {
          trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPriceExTax * ((100 - discPct) / 100), this.objectService.objectHeader.isHomeCurrency?this.objectService.precisionSales.localMax:this.objectService.precisionSales.foreignMax) : trxLine.unitPriceExTax;
        }
        if (trxLine.itemGroupInfo) {
          trxLine.brandId = trxLine.itemGroupInfo.brandId;
          trxLine.groupId = trxLine.itemGroupInfo.groupId;
          trxLine.seasonId = trxLine.itemGroupInfo.seasonId;
          trxLine.categoryId = trxLine.itemGroupInfo.categoryId;
          trxLine.deptId = trxLine.itemGroupInfo.deptId;
          trxLine.oriDiscId = trxLine.itemPricing.discountGroupId;
        }
      }

      // for isPricingApproval
      trxLine.oriUnitPrice = trxLine.unitPrice;
      trxLine.oriUnitPriceExTax = trxLine.unitPriceExTax;
      trxLine.oriDiscountGroupCode = trxLine.discountGroupCode;
      trxLine.oriDiscountExpression = trxLine.discountExpression;

      return trxLine;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  steps */

  async nextStep() {
    try {
      this.navController.navigateForward("/transactions/quotation/quotation-cart");
    } catch (e) {
      console.error(e);
    }
  }

  previousStep() {
    try {
      this.navController.navigateBack("/transactions/quotation/quotation-header");
    } catch (e) {
      console.error(e);
    }
  }

  async backToDetail() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Are you sure to cancel?",
        subHeader: "Changes made will be discard.",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Yes",
            role: "confirm",
          },
          {
            text: "No",
            role: "cancel",
          }]
      });
      await actionSheet.present();
      const { role } = await actionSheet.onWillDismiss();
      if (role === "confirm") {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectService.objectHeader.quotationId
          }
        }
        this.objectService.resetVariables();
        this.navController.navigateRoot("/transactions/quotation/quotation-detail", navigationExtras);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
