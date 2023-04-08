import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { SalesOrderHeader } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from 'src/app/shared/models/item-list';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-sales-order-item',
  templateUrl: './sales-order-item.page.html',
  styleUrls: ['./sales-order-item.page.scss'],
  providers: [DatePipe, SearchItemService, { provide: 'apiObject', useValue: 'mobileSalesOrder' }]
})
export class SalesOrderItemPage implements OnInit, ViewWillEnter {

  objectHeader: SalesOrderHeader;

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    private salesOrderService: SalesOrderService,
    private promotionEngineService: PromotionEngineService,
    private navController: NavController,
    private commonService: CommonService,
    private toastService: ToastService) { }

  ionViewWillEnter(): void {
    this.itemInCart = this.salesOrderService.itemInCart;
  }

  ngOnInit() {
    try {
      this.objectHeader = this.salesOrderService.header;
      if (!this.objectHeader || this.objectHeader === undefined || this.objectHeader === null) {
        this.navController.navigateBack('/transactions/sales-order/sales-order-header');
      }
      this.componentsLoad();
    } catch (e) {
      console.error(e);
    }
  }

  componentsLoad() {
    this.loadModuleControl();
    this.loadMasterList();
    this.loadFullItemList();
    this.loadPromotion();
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

  fullMasterList: MasterList[] = [];
  customerMasterList: MasterListDetails[] = [];
  discountGroupMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.salesOrderService.getMasterList().subscribe(response => {
      this.fullMasterList = response;
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.discountGroupMasterList = response.filter(x => x.objectName == 'DiscountGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  promotionMaster: PromotionMaster[] = [];
  loadPromotion() {
    try {
      let trxDate = this.objectHeader.trxDate;
      if (trxDate) {
        this.salesOrderService.getPromotion(format(new Date(trxDate), 'yyyy-MM-dd'), this.objectHeader.customerId).subscribe(response => {
          this.promotionMaster = response;
        }, error => {
          throw error;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  fullItemList: ItemList[] = [];
  loadFullItemList() {
    try {
      this.salesOrderService.getFullItemList().subscribe(response => {
        this.fullItemList = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  itemInCart: TransactionDetail[] = [];
  async onItemAdded(event: TransactionDetail) {
    try {
      if (this.itemInCart.findIndex(r => r.itemId === event.itemId) > -1) {
        if (event.variationTypeCode === '0') {
          this.itemInCart.find(r => r.itemId === event.itemId).qtyRequest += event.qtyRequest;
        } else {
          let vd = event.variationDetails.flatMap(r => r.details).filter(r => r.qtyRequest > 0);
          vd.forEach(r => {
            this.itemInCart.find(rr => rr.itemId === event.itemId).variationDetails.flatMap(rr => rr.details).forEach(rr => {
              if (rr.itemSku === r.itemSku) {
                rr.qtyRequest += r.qtyRequest;
              }
            })
          })
        }
        await this.computeAllAmount(this.itemInCart.find(r => r.itemId === event.itemId));
      } else {
        let trxLine = JSON.parse(JSON.stringify(event));
        trxLine = this.assignLineUnitPrice(trxLine);

        if (this.objectHeader.isItemPriceTaxInclusive) {
          await this.computeUnitPriceExTax(trxLine);
        } else {
          await this.computeUnitPrice(trxLine);
        }

        if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
          trxLine.uuid = uuidv4();
          let discPct = Number(trxLine.discountExpression?.replace("%", ""));
          if (this.objectHeader.isItemPriceTaxInclusive) {
            trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPrice * ((100 - discPct) / 100), this.objectHeader.maxPrecision) : trxLine.unitPrice;
          } else {
            trxLine.discountedUnitPrice = discPct ? this.commonService.roundToPrecision(trxLine.unitPriceExTax * ((100 - discPct) / 100), this.objectHeader.maxPrecision) : trxLine.unitPriceExTax;
          }
          trxLine.oriDiscountGroupCode = trxLine.discountGroupCode;
          trxLine.oriDiscountExpression = trxLine.discountExpression;
        }
        this.itemInCart.push(trxLine);
        await this.computeAllAmount(this.itemInCart[0]);
        await this.assignSequence();
      }
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

  /* #region toggle show available qty */

  showAvailQty: boolean = false;
  toggleShowAvailQty() {
    this.showAvailQty = !this.showAvailQty;
  }

  /* #endregion */
  
  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  tax handle here */

  promotionEngineApplicable: boolean = true;
  configSalesActivatePromotionEngine: boolean;
  disablePromotionCheckBox: boolean = false;
  async computeAllAmount(trxLine: TransactionDetail) {
    try {
      await this.computeDiscTaxAmount(trxLine);
      if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine && !this.disablePromotionCheckBox) {
        this.promotionEngineService.runPromotionEngine(this.itemInCart.filter(x => x.qtyRequest > 0), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision, this.discountGroupMasterList, true)
      }
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

  assignLineUnitPrice(trxLine: TransactionDetail) {
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
      return trxLine;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  steps */

  async nextStep() {
    try {
      this.salesOrderService.setChoosenItems(this.itemInCart);
      this.navController.navigateForward('/transactions/sales-order/sales-order-cart');
    } catch (e) {
      console.error(e);
    }
  }

  previousStep() {
    try {
      this.navController.navigateBack('/transactions/sales-order/sales-order-header');
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
