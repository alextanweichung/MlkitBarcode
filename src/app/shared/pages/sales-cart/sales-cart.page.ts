import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TransactionDetail } from '../../models/transaction-detail';
import { SalesHistoryInfo, SalesItemInfoRoot } from '../../models/sales-item-info';
import { AlertController, IonPopover, ModalController } from '@ionic/angular';
import { ItemSalesHistoryPage } from '../item-sales-history/item-sales-history.page';
import { MasterListDetails } from '../../models/master-list-details';
import { PrecisionList } from '../../models/precision-list';
import { PromotionMaster } from '../../models/promotion-engine';
import { PromotionEngineService } from '../../services/promotion-engine.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from '../../services/common.service';
import Decimal from 'decimal.js';
import { Capacitor } from '@capacitor/core';
import { ConfigService } from 'src/app/services/config/config.service';
import { InnerVariationDetail } from '../../models/variation-detail';
import { GeneralTransactionService } from '../../services/general-transaction.service';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModuleControl } from '../../models/module-control';
import { Validators } from '@angular/forms';

@Component({
   selector: 'app-sales-cart',
   templateUrl: './sales-cart.page.html',
   styleUrls: ['./sales-cart.page.scss'],
})
export class SalesCartPage implements OnInit, OnChanges {

   inputType: string = "number";
   discExprRegex: RegExp = /[\d./+%]+/;

   @Input() objectHeader: any;
   @Input() objectDetail: TransactionDetail[] = [];
   @Input() objectHistory: SalesItemInfoRoot[] = [];

   @Input() isQuotation: boolean = false;
   @Input() isSalesOrder: boolean = false;
   @Input() isBackToBackOrder: boolean = false;
   @Input() isConsignmentInvoice: boolean = false;
   @Input() showLatestPrice: boolean = false;
   @Input() isAutoPromotion: boolean = true;

   @Input() isCalculateMargin: boolean = false;

   @Input() discountGroupMasterList: MasterListDetails[] = [];
   @Input() itemVariationXMasterList: MasterListDetails[] = [];
   @Input() itemVariationYMasterList: MasterListDetails[] = [];
   @Input() uomMasterList: MasterListDetails[] = [];
   @Input() precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   @Input() precisionSalesUnitPrice: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
   @Input() promotionMaster: PromotionMaster[] = [];
   @Input() restrictTrxFields: any = {};

   @Output() onLineEditComplete: EventEmitter<TransactionDetail[]> = new EventEmitter();
   @Output() onHeaderEditComplete: EventEmitter<any> = new EventEmitter();

   constructor(
      private transactionService: GeneralTransactionService,
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      private promotionEngineService: PromotionEngineService,
      private toastService: ToastService,
      private alertController: AlertController,
      private modalController: ModalController
   ) {
      if (Capacitor.getPlatform() === "android") {
         this.inputType = "number";
      }
      if (Capacitor.getPlatform() === "ios") {
         this.inputType = "tel";
      }
   }

   async ngOnChanges(changes: SimpleChanges): Promise<void> {
      if (changes.isAutoPromotion) {
         await this.promotionCheck();
      }
   }

   ngOnInit() {
      this.loadModuleControl();
   }

   moduleControl: ModuleControl[];
   useTax: boolean;
   validateItemSupplyCurrency: boolean;
   configUseDiscountCode: boolean;
   configChangeDiscountCode: boolean;
   configSalesActivatePromotionEngine: boolean;
   systemWideActivateVariationRatio: boolean;
   useAutoCompleteForItemCode: boolean = false;
   configSalesOrderQuantityControl: string = "0";
   systemWideBlockConvertedCode: boolean;
   systemWideFocusQtyAfterItemSelection: boolean = false;
   consignBearingComputeGrossMargin: boolean = false;
   configOrderingActivateMOQControl: boolean;
   configOrderingActivateCasePackQtyControl: boolean;
   isCasePackQtyControlWarningOnly: boolean = false;
   configSalesActivateRestrictSelling: boolean;
   configSalesActivateTradingMargin: boolean;
   configPOSOActivateItemSpecification: boolean;
   configApplyLineMasterUDValueByItemAttribute: string = "0";
   orderingPriceApprovalEnabledFields: string = "0";
   configSystemWideActivateExtraDiscount: boolean = false;
   configSalesTransactionShowHistory: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let useTax = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
         if (useTax != undefined) {
            this.useTax = useTax.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.useTax = false;
         }

         let SalesValidateItemCurrency = this.moduleControl.find(x => x.ctrlName === "SalesValidateItemCurrency");
         if (SalesValidateItemCurrency != undefined) {
            this.validateItemSupplyCurrency = SalesValidateItemCurrency.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.validateItemSupplyCurrency = false;
         }

         let systemWideActivateDiscountCode = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateDiscountCode");
         if (systemWideActivateDiscountCode && systemWideActivateDiscountCode.ctrlValue.toUpperCase() === "Y") {
            this.configUseDiscountCode = true;
         } else {
            this.configUseDiscountCode = false;
         }

         let salesTrxAllowChangeDiscCode = this.moduleControl.find(x => x.ctrlName === "SalesTrxAllowChangeDiscCode");
         if (salesTrxAllowChangeDiscCode && salesTrxAllowChangeDiscCode.ctrlValue.toUpperCase() === "Y") {
            this.configChangeDiscountCode = true;
         } else {
            this.configChangeDiscountCode = false;
         }
         let salesActivatePromotionEngine = this.moduleControl.find(x => x.ctrlName === "SalesActivatePromotionEngine");
         if (salesActivatePromotionEngine && salesActivatePromotionEngine.ctrlValue.toUpperCase() === "Y") {
            this.configSalesActivatePromotionEngine = true;
         } else {
            this.configSalesActivatePromotionEngine = false;
         }

         let systemWideActivateVariationRatio = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateVariationRatio");
         if (systemWideActivateVariationRatio) {
            this.systemWideActivateVariationRatio = systemWideActivateVariationRatio.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideActivateVariationRatio = false;
         }

         let useAutoCompleteForItemCode = this.moduleControl.find(x => x.ctrlName === "UseAutoCompleteForItemCode")
         if (useAutoCompleteForItemCode) {
            this.useAutoCompleteForItemCode = useAutoCompleteForItemCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.useAutoCompleteForItemCode = false;
         }

         let salesOrderQuantityControl = this.moduleControl.find(x => x.ctrlName === "SalesOrderQuantityControl")
         if (salesOrderQuantityControl && this.isSalesOrder && !this.isBackToBackOrder) {
            this.configSalesOrderQuantityControl = salesOrderQuantityControl.ctrlValue;
         }

         let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
         if (blockConvertedCode) {
            this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideBlockConvertedCode = false;
         }

         let focusQty = this.moduleControl.find(x => x.ctrlName === "SystemWideFocusQtyAfterItemSelection");
         if (focusQty && focusQty.ctrlValue.toUpperCase() === "Y") {
            this.systemWideFocusQtyAfterItemSelection = true;
         } else {
            this.systemWideFocusQtyAfterItemSelection = false;
         }

         let computationMethod = this.moduleControl.find(x => x.ctrlName === "ConsignBearingComputeGrossMargin");
         if (computationMethod && computationMethod.ctrlValue.toUpperCase() === "Y") {
            this.consignBearingComputeGrossMargin = true;
         } else {
            this.consignBearingComputeGrossMargin = false;
         }

         let moqCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateMOQControl");
         if (moqCtrl && moqCtrl.ctrlValue.toUpperCase() === "Y") {
            if (this.isSalesOrder || this.isBackToBackOrder) {
               this.configOrderingActivateMOQControl = true;
            } else {
               this.configOrderingActivateMOQControl = false;
            }
         } else {
            this.configOrderingActivateMOQControl = false;
         }

         let casePackCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateCasePackQtyControl");
         if (casePackCtrl && (casePackCtrl.ctrlValue.toUpperCase() === "Y" || casePackCtrl.ctrlValue.toUpperCase() === "W")) {
            if (this.isQuotation || this.isSalesOrder || this.isBackToBackOrder) {
               this.configOrderingActivateCasePackQtyControl = true;
               if (casePackCtrl.ctrlValue.toUpperCase() === "W") {
                  this.isCasePackQtyControlWarningOnly = true;
               } else {
                  this.isCasePackQtyControlWarningOnly = false;
               }
            } else {
               this.configOrderingActivateCasePackQtyControl = false;
               this.isCasePackQtyControlWarningOnly = false;
            }
         } else {
            this.configOrderingActivateCasePackQtyControl = false;
            this.isCasePackQtyControlWarningOnly = false;
         }

         let restrictSalesCtrl = this.moduleControl.find(x => x.ctrlName === "SalesActivateRestrictSelling");
         if (restrictSalesCtrl && restrictSalesCtrl.ctrlValue.toUpperCase() === "Y") {
            if (this.isQuotation || this.isSalesOrder || this.isBackToBackOrder) {
               this.configSalesActivateRestrictSelling = true;
            } else {
               this.configSalesActivateRestrictSelling = false;
            }
         } else {
            this.configSalesActivateRestrictSelling = false;
         }
         let isTradingMargin = this.moduleControl.find(x => x.ctrlName === "SalesActivateTradingMargin");
         if (isTradingMargin && isTradingMargin.ctrlValue.toUpperCase() === "Y") {
            if (this.isQuotation || this.isSalesOrder || this.isBackToBackOrder) {
               this.configSalesActivateTradingMargin = true;
            } else {
               this.configSalesActivateTradingMargin = false;
            }
         } else {
            this.configSalesActivateTradingMargin = false;
         }

         let activateItemSpec = this.moduleControl.find(x => x.ctrlName === "POSOActivateItemSpecification");
         if (activateItemSpec && activateItemSpec.ctrlValue.toUpperCase() === "Y" && (this.isBackToBackOrder || this.isSalesOrder)) {
            this.configPOSOActivateItemSpecification = true;
         } else {
            this.configPOSOActivateItemSpecification = false;
         }

         let applyItemMasterUD = this.moduleControl.find(x => x.ctrlName === "ApplyLineMasterUDValueByItemAttribute")
         if (applyItemMasterUD) {
            this.configApplyLineMasterUDValueByItemAttribute = applyItemMasterUD.ctrlValue;
         }

         let priceApprovalEnabledFields = this.moduleControl.find(x => x.ctrlName === "OrderingPriceApprovalEnabledFields");
         if (priceApprovalEnabledFields) {
            this.orderingPriceApprovalEnabledFields = priceApprovalEnabledFields.ctrlValue;
         }

         let configSystemWideActivateExtraDiscount = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateExtraDiscount");
         if (configSystemWideActivateExtraDiscount && configSystemWideActivateExtraDiscount.ctrlValue.toUpperCase() === "Y") {
            this.configSystemWideActivateExtraDiscount = true;
         } else {
            this.configSystemWideActivateExtraDiscount = false;
         }

         let salesTransactionShowHistory = this.moduleControl.find(x => x.ctrlName === "SalesTransactionShowHistory");
         if (salesTransactionShowHistory && salesTransactionShowHistory.ctrlValue.toUpperCase() === 'Y') {
            this.configSalesTransactionShowHistory = true;
         } else {
            this.configSalesTransactionShowHistory = false;
         }

      })
   }

   getPromoInfo(promoEventId: number) {
      if (this.promotionMaster.length > 0) {
         let found = this.promotionMaster.find(x => x.promoEventId === promoEventId);
         if (found) {
            return found;
         } else {
            return null;
         }
      } else {
         return null;
      }
   }

   async presentDeleteItemAlert(data: TransactionDetail, index: number) {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to delete?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "danger",
                  handler: () => {
                     this.removeItem(data, index);
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {

                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   async removeItem(data: TransactionDetail, index: number) {
      try {
         await this.objectDetail.splice(index, 1);
         if (this.configSalesActivatePromotionEngine && this.objectHeader.isAutoPromotion && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
            await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  modal to edit each item */

   isModalOpen: boolean = false;
   selectedItem: TransactionDetail;
   selectedIndex: number;
   showEditModal(data: TransactionDetail, rowIndex: number) {
      this.selectedItem = JSON.parse(JSON.stringify(data)) as TransactionDetail;
      this.selectedIndex = rowIndex;
      this.isModalOpen = true;
   }

   async saveChanges() {
      if (this.selectedIndex === null || this.selectedIndex === undefined) {
         this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
         return;
      } else {
         let hasQtyError: boolean = false;
         let totalQty: number = 0;
         if (this.selectedItem.variationTypeCode === "0") {
            hasQtyError = (this.selectedItem.qtyRequest ?? 0) <= 0;
         } else {
            this.selectedItem.variationDetails.forEach(r => {
               r.details.forEach(rr => {
                  totalQty += (rr.qtyRequest ?? 0)
               })
            })
            hasQtyError = totalQty <= 0;
         }
         if (hasQtyError) {
            this.toastService.presentToast("Controll Error", "Invalid quantity", "top", "warning", 1000);
         } else {
            this.objectDetail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
            this.computeAllAmount(this.objectDetail[this.selectedIndex], this.objectDetail);
            // await this.computeDiscTaxAmount(this.objectDetail[this.selectedIndex]);
            // if (this.configSalesActivateTradingMargin) {
            //    this.computeTradingMarginAmount(this.objectDetail[this.selectedIndex]);
            // }
            this.hideEditModal();
            if (this.selectedItem.isPricingApproval) {
               // todo : update header isPricingApproval
               this.objectHeader.isPricingApproval = true;
            }
         }
      }
   }

   async cancelChanges() {
      try {
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to discard changes?",
            buttons: [
               {
                  text: "OK",
                  role: "confirm",
                  cssClass: "success",
                  handler: () => {
                     this.isModalOpen = false;
                  },
               },
               {
                  text: "Cancel",
                  role: "cancel",
                  handler: () => {

                  }
               },
            ],
         });
         await alert.present();
      } catch (e) {
         console.error(e);
      }
   }

   hideEditModal() {
      this.isModalOpen = false;
   }

   async onModalHide() {
      this.selectedIndex = null;
      this.selectedItem = null;
      if (this.configSalesActivatePromotionEngine && this.objectHeader.isAutoPromotion && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
         await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
      }
   }

   /* #endregion */

   /* #region calculation */

   checkQtyInput(trxLine: TransactionDetail) {
      if (this.configSalesOrderQuantityControl === "1") {
         if (trxLine.qtyRequest && trxLine.qtyRequest > trxLine.actualQty) {
            this.toastService.presentToast("Invalid Min Order Quantity", "Requested quantity [" + trxLine.qtyRequest + "] exceeded actual quantity [" + trxLine.actualQty + "]", "top", "warning", 1000);
            setTimeout(() => {
               trxLine.qtyRequest = null;
               this.computeAllAmount(trxLine);
            }, 1);
         }
      } else if (this.configSalesOrderQuantityControl === "2") {
         if (trxLine.qtyRequest && trxLine.qtyRequest > trxLine.availableQty) {
            this.toastService.presentToast("Invalid Min Order Quantity", "Requested quantity [" + trxLine.qtyRequest + "] exceeded available quantity [" + trxLine.availableQty + "]", "top", "warning", 1000);
            setTimeout(() => {
               trxLine.qtyRequest = null;
               this.computeAllAmount(trxLine);
            }, 1);
         }
      }
      if (this.configOrderingActivateCasePackQtyControl) {
         if (trxLine.qtyRequest && trxLine.casePackQty) {
            let checkRemainder = trxLine.qtyRequest % trxLine.casePackQty;
            if (checkRemainder != 0) {
               this.toastService.presentToast("Invalid Case Pack Quantity", "Requested quantity [" + trxLine.qtyRequest + "] does not matach with case pack quantity [" + trxLine.casePackQty + "]", "top", "warning", 1000);
               if (!this.isCasePackQtyControlWarningOnly) {
                  setTimeout(() => {
                     trxLine.qtyRequest = null;
                     this.computeAllAmount(trxLine);
                  }, 1);
               }
            }
         }
      }
   }

   async computeAllAmount(trxLine: TransactionDetail, trxLineArray?: TransactionDetail[]) {
      let validate = this.discExprRegex.exec(trxLine.discountExpression);
      console.log("🚀 ~ file: sales-cart.page.ts:441 ~ SalesCartPage ~ computeAllAmount ~ validate:", validate)
      if (validate.input !== validate[0]) {
         trxLine.discountExpression = validate[0]
         this.toastService.presentToast("Validation Error", "Disc. Expr replaced to valid format", "top", "warning", 1000);
      }
      
      // trxLine is actually selectedItem
      if (trxLineArray) {
         this.objectDetail = trxLineArray
      }
      if (trxLine.assembly && trxLine.assembly.length > 0) {
         this.computeAssemblyQty(trxLine);
      }
      await this.computeDiscTaxAmount(trxLine);
      if (this.isCalculateMargin) {
         this.computeMarginAmount(trxLine);
      }
      if (this.configSalesActivateTradingMargin) {
         this.computeTradingMarginAmount(trxLine);
      }
      if (this.configSalesActivatePromotionEngine && this.objectHeader.isAutoPromotion && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
         await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
      }
   }

   computeMarginAmount(trxLine: TransactionDetail) {
      //trxLine = this.commonService.computeMarginAmt(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.maxPrecision);
      trxLine = this.commonService.computeMarginAmtByConsignmentConfig(trxLine, this.objectHeader, this.consignBearingComputeGrossMargin, true);
      // this.onEditComplete();
   }

   computeUnitPriceExTax(trxLine: TransactionDetail, trxLineArray?: TransactionDetail[]) {
      if (trxLineArray) {
         this.objectDetail = trxLineArray
      }
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);
      trxLine.oriUnitPriceExTax = this.commonService.computeOriUnitPriceExTax(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);

      this.computeDiscTaxAmount(trxLine);
      if (this.isCalculateMargin) {
         this.computeMarginAmount(trxLine);
      }
      if (this.configSalesActivateTradingMargin) {
         this.computeTradingMarginAmount(trxLine);
      }
      // this.onEditComplete();
   }

   computeUnitPrice(trxLine: TransactionDetail, trxLineArray?: TransactionDetail[]) {
      if (trxLineArray) {
         this.objectDetail = trxLineArray
      }
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);
      trxLine.oriUnitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.objectHeader.isHomeCurrency ? this.precisionSalesUnitPrice.localMax : this.precisionSalesUnitPrice.foreignMax);
      this.computeDiscTaxAmount(trxLine);
      if (this.isCalculateMargin) {
         this.computeMarginAmount(trxLine);
      }
      if (this.configSalesActivateTradingMargin) {
         this.computeTradingMarginAmount(trxLine);
      }
      // this.onEditComplete();
   }

   onDiscCodeChanged(item: TransactionDetail, event: any) {
      if (this.isCalculateMargin && item.itemId) {
         this.transactionService.getConsignmentMarginForConsignmentSales(item.itemId, format(new Date, "yyyy-MM-dd"), this.objectHeader.toLocationId, event.detail.value).subscribe({
            next: (response) => {
               item.bearPct = response.bearPct;
               item.marginPct = response.marginPct;
               this.assignDiscPct(item, event.detail.value);
            },
            error: (error) => {
               console.error(error);
            }
         })
      } else if (this.configSalesActivateTradingMargin) {
         let keyId: number;
         if (this.objectHeader.businessModelType === "T") {
            keyId = this.objectHeader.customerId;
         } else {
            keyId = this.objectHeader.toLocationId;
         }
         this.transactionService.getTradingMargin(item.itemId, format(new Date, "yyyy-MM-dd"), keyId, event.detail.value).subscribe({
            next: (response) => {
               if (response.tradingMarginPct) {
                  item.tradingMarginPct = response.tradingMarginPct;
               } else {
                  item.tradingMarginPct = 0;
               }
               this.assignDiscPct(item, event.detail.value);
            },
            error: (error) => {
               console.error(error);
            }
         })

      } else {
         this.assignDiscPct(item, event.detail.value);
      }
   }

   assignDiscPct(item: TransactionDetail, discountGroupCode: any) {
      let discPct = this.discountGroupMasterList.find(x => x.code === discountGroupCode);
      if (discPct) {
         if (discPct.attribute1 === "0") {
            item.discountExpression = null;            
            if (this.configSystemWideActivateExtraDiscount) {
               if (discPct.attribute4) {
                  item.discountExpression = discPct.attribute4;
               }
            }
         } else {
            item.discountExpression = discPct.attribute1 + "%";
            if (this.configSystemWideActivateExtraDiscount) {
               if (discPct.attribute4) {
                  item.discountExpression = item.discountExpression + "/" + discPct.attribute4;
               }
            }
         }
         this.computeAllAmount(item);
      }
   }

   computeDiscTaxAmount(trxLine: TransactionDetail, trxLineArray?: TransactionDetail[]) {
      if (trxLineArray) {
         this.objectDetail = trxLineArray
      }
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
      if (this.isConsignmentInvoice) {
         trxLine.invoiceAmt = trxLine.subTotal;
      }
      // this.onEditComplete();
   }

   computeTradingMarginAmount(trxLine: TransactionDetail) {
      trxLine = this.commonService.computeTradingMargin(trxLine, this.useTax, trxLine.taxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax);
   }

   computeAssemblyQty(trxLine: TransactionDetail) {
      trxLine.assembly.forEach(assembly => {
         if (trxLine.qtyRequest) {
            assembly.qtyRequest = new Decimal(assembly.itemComponentQty).mul(trxLine.qtyRequest).toNumber();
         } else {
            assembly.qtyRequest = null;
         }
      });
   }

   async promotionCheck() {
      if (this.isAutoPromotion) {
         if (this.configSalesActivatePromotionEngine && this.objectHeader.isAutoPromotion && (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B")) {
            await this.promotionEngineService.runPromotionEngine(this.objectDetail.filter(x => x.qtyRequest > 0).flatMap(r => r), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.isHomeCurrency ? this.precisionSales.localMax : this.precisionSales.foreignMax, this.discountGroupMasterList, false, this.configSalesActivateTradingMargin)
         }
      } else {
         this.objectDetail.forEach(async line => {
            line = this.commonService.reversePromoImpact(line);
            await this.computeDiscTaxAmount(line);
         })
      }
   }

   /* #endregion */

   /* #region  edit qty */

   computeQty() {
      try {
         if (this.selectedItem.variationTypeCode === "0") {
            this.computeAllAmount(this.selectedItem);
         }
         if (this.selectedItem.variationTypeCode === "1" || this.selectedItem.variationTypeCode === "2") {
            var totalQty = 0;
            if (this.selectedItem.variationDetails) {
               this.selectedItem.variationDetails.forEach(x => {
                  x.details.forEach(y => {
                     if (y.qtyRequest && y.qtyRequest < 0) {
                        this.toastService.presentToast("Control Error", "Invalid quantity", "top", "warning", 1000);
                     }
                     totalQty = totalQty + y.qtyRequest;
                  });
               })
            }
            this.selectedItem.qtyRequest = totalQty;
            this.computeAllAmount(this.selectedItem);
         }
      } catch (e) {
         console.error(e);
      }
   }

   increaseVariationQty(data: InnerVariationDetail) {
      try {
         data.qtyRequest = (data.qtyRequest ?? 0) + 1;
         this.computeQty();
      } catch (e) {
         console.error(e);
      }
   }

   decreaseVariationQty(data: InnerVariationDetail) {
      try {
         if ((data.qtyRequest - 1) < 0) {
            data.qtyRequest = 0;
         } else {
            data.qtyRequest -= 1;
         }
         this.computeQty();
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region more action popover */

   isPricingPopoverOpen: boolean = false;
   @ViewChild("pricingPopover", { static: false }) pricingPopover: IonPopover;
   showPricingPopover(event) {
      try {
         this.pricingPopover.event = event;
         this.isPricingPopoverOpen = true;
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   onPricingApprovalSwitch(event: any) {
      if (event.detail.checked) {
         switch (this.orderingPriceApprovalEnabledFields) {
            case "0":
               if (this.restrictTrxFields.unitPrice) {
                  this.restrictTrxFields.unitPrice = false;
               }
               if (this.restrictTrxFields.unitPriceExTax) {
                  this.restrictTrxFields.unitPriceExTax = false;
               }
               if (this.restrictTrxFields.discountExpression) {
                  this.restrictTrxFields.discountExpression = false;
               }
               if (this.restrictTrxFields.discountGroupCode) {
                  this.restrictTrxFields.discountGroupCode = false;
               }
               break;
            case "1":
               if (this.restrictTrxFields.unitPrice) {
                  this.restrictTrxFields.unitPrice = false;
               }
               if (this.restrictTrxFields.unitPriceExTax) {
                  this.restrictTrxFields.unitPriceExTax = false;
               }
               break;
            case "2":
               if (this.restrictTrxFields.discountExpression) {
                  this.restrictTrxFields.discountExpression = false;
               }
               if (this.restrictTrxFields.discountGroupCode) {
                  this.restrictTrxFields.discountGroupCode = false;
               }
               break;
         }
      } else {
         if (this.restrictTrxFields.unitPrice === false) {
            this.restrictTrxFields.unitPrice = true;
         }
         if (this.restrictTrxFields.unitPriceExTax === false) {
            this.restrictTrxFields.unitPriceExTax = true;
         }
         if (this.restrictTrxFields.discountExpression === false) {
            this.restrictTrxFields.discountExpression = true;
         }
         if (this.restrictTrxFields.discountGroupCode === false) {
            this.restrictTrxFields.discountGroupCode = true;
         }
      }
   }

   /* #region sales history */

   getSalesHistoryByItemId(itemId: number): SalesHistoryInfo[] {
      let found = this.objectHistory.filter(r => r.masterInfo.itemId === itemId);
      if (found && found.length > 0) {
         return found.flatMap(r => r.historyInfo);
      }
      return null;
   }

   getLatestSalesHistoryByItemId(itemId: number): SalesHistoryInfo {
      let found = this.objectHistory.filter(r => r.masterInfo.itemId === itemId);
      if (found && found.length > 0) {
         return found.flatMap(r => r.historyInfo)[0];
      }
      return null;
   }

   async showPriceHistoryModal(itemId: number) {
      let found = this.getSalesHistoryByItemId(itemId);
      if (found) {
         const modal = await this.modalController.create({
            component: ItemSalesHistoryPage,
            componentProps: {
               selectedHistory: found
            },
            canDismiss: true
         })
         modal.present();
      } else {
         this.toastService.presentToast("", "Sales History not found", "top", "warning", 1000);
      }
   }

   /* #endregion */

}
