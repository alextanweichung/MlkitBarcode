import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { QuotationHeader } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { ItemCartPage } from 'src/app/shared/pages/item-cart/item-cart.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-quotation-item',
  templateUrl: './quotation-item.page.html',
  styleUrls: ['./quotation-item.page.scss'],
  providers: [DatePipe, SearchItemService, { provide: 'apiObject', useValue: 'mobileQuotation' }]
})
export class QuotationItemPage implements OnInit, ViewWillEnter {

  objectHeader: QuotationHeader;

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  @ViewChild('itemCatalog', { static: false }) itemCatalog: ItemCartPage;

  constructor(
    private authService: AuthService,
    public objectService: QuotationService,
    private navController: NavController,
    private commonService: CommonService,
    private toastService: ToastService) {
    try {
      this.objectHeader = this.objectService.header;
      this.itemInCart = this.objectService.itemInCart; // update itemCart when this page shown, to handle qty update + delete
      if (!this.objectHeader || this.objectHeader === undefined || this.objectHeader === null) {
        this.navController.navigateBack('/transactions/quotation/quotation-header');
      }
    } catch (e) {
      console.error(e);
    }
  }

  ionViewWillEnter(): void {
    try {
      this.objectHeader = this.objectService.header;
      this.itemInCart = this.objectService.itemInCart; // update itemCart when this page shown, to handle qty update + delete
      if (!this.objectHeader || this.objectHeader === undefined || this.objectHeader === null) {
        this.navController.navigateBack('/transactions/quotation/quotation-header');
      } else {
        this.componentsLoad();
      }
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
  }

  componentsLoad() {
    this.loadModuleControl();
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    try {
      this.authService.moduleControlConfig$.subscribe(obj => {
        this.moduleControl = obj;
        let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
        if (SystemWideActivateTaxControl != undefined) {
          this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() == "Y" ? true : false;
        }
        let salesActivatePromotionEngine = this.moduleControl.find(x => x.ctrlName === "SalesActivatePromotionEngine")?.ctrlValue;
        if (salesActivatePromotionEngine && salesActivatePromotionEngine.toUpperCase() == "Y") {
          this.configSalesActivatePromotionEngine = true;
        } else {
          this.configSalesActivatePromotionEngine = false;
        }
      }, error => {
        throw error;
      })
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })      
    } catch (e) {
      console.error(e);
    }
  }

  itemInCart: TransactionDetail[] = [];
  async onItemAdded(event: TransactionDetail) {
    try {
      let trxLine = JSON.parse(JSON.stringify(event));
      trxLine = this.assignTrxItemToDataLine(trxLine);
      if (this.objectHeader.isItemPriceTaxInclusive) {
        await this.computeUnitPriceExTax(trxLine);
      } else {
        await this.computeUnitPrice(trxLine);
      }
      this.itemInCart.push(trxLine);
      await this.computeAllAmount(this.itemInCart[0]);
      await this.assignSequence();
      this.toastService.presentToast('Item Added to Cart', '', 'top', 'success', 1000);
    } catch (e) {
      console.error(e);
    }
  }

  assignSequence() {
    let index = 0;
    this.itemInCart.forEach(r => {
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

  promotionEngineApplicable: boolean = true;
  configSalesActivatePromotionEngine: boolean;
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
      if (trxLine.variationTypeCode === '1' || trxLine.variationTypeCode === '2') {
        trxLine.qtyRequest = trxLine.variationDetails.flatMap(r => r.details).flatMap(r => r.qtyRequest).filter(r => r > 0).reduce((a, c) => Number(a) + Number(c));
      }
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPriceExTax(trxLine: TransactionDetail) {
    try {
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectHeader.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    try {
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.objectHeader.maxPrecision);
      this.computeDiscTaxAmount(trxLine);      
    } catch (e) {
      console.error(e);
    }
  }

  async computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      await this.getVariationSum(trxLine);
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision);
    } catch (e) {
      console.error(e);
    }
  }

  assignTrxItemToDataLine(trxLine: TransactionDetail) {
    try {
      if (this.useTax) {
        if (this.objectHeader.isItemPriceTaxInclusive) {
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
      trxLine.unitPrice = this.commonService.roundToPrecision(trxLine.unitPrice, this.objectHeader.maxPrecision);
      trxLine.unitPriceExTax = this.commonService.roundToPrecision(trxLine.unitPriceExTax, this.objectHeader.maxPrecision);
      
      if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
        trxLine.uuid = uuidv4();
        let discPct = Number(trxLine.discountExpression?.replace("%", ""));
        if (this.objectHeader.isItemPriceTaxInclusive) {
          trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPrice * ((100 - discPct) / 100), this.objectHeader.maxPrecision) : trxLine.unitPrice;
        } else {
          trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPriceExTax * ((100 - discPct) / 100), this.objectHeader.maxPrecision) : trxLine.unitPriceExTax;
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
      this.objectService.setChoosenItems(this.itemInCart);
      this.navController.navigateForward('/transactions/quotation/quotation-cart');
    } catch (e) {
      console.error(e);
    }
  }

  previousStep() {
    try {
      this.navController.navigateBack('/transactions/quotation/quotation-header');
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
