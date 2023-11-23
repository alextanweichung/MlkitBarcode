import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { QuotationRoot } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ShippingInfo } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';

@Component({
  selector: 'app-quotation-cart',
  templateUrl: './quotation-cart.page.html',
  styleUrls: ['./quotation-cart.page.scss'],
})
export class QuotationCartPage implements OnInit, ViewWillEnter {

  moduleControl: ModuleControl[] = [];
  submit_attempt: boolean = false;
  inputType: string = "number";

  constructor(
    public objectService: QuotationService,
    private authService: AuthService,
    private commonService: CommonService,
    private promotionEngineService: PromotionEngineService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private navController: NavController
  ) {
    if (Capacitor.getPlatform() === "android") {
      this.inputType = "number";
    }
    if (Capacitor.getPlatform() === "ios") {
      this.inputType = "tel";
    }
  }

  async ionViewWillEnter(): Promise<void> {
    await this.objectService.loadRequiredMaster();
    if (this.objectService.salesActivatePromotionEngine) {
      await this.promotionEngineService.runPromotionEngine(this.objectService.objectDetail.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax, this.objectService.discountGroupMasterList, false)
    }
    this.loadRestrictColumms();
    this.loadAvailableAddresses();
  }

  ngOnInit() {

  }

  availableAddress: ShippingInfo[] = [];
  shippingInfo: ShippingInfo;
  loadAvailableAddresses() {
    try {
      this.availableAddress = [];
      if (this.objectService.objectHeader) {
        if (this.objectService.objectHeader.businessModelType === "T") {
          this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectService.objectHeader.customerId).flatMap(r => r.shippingInfo);
        } else {
          this.availableAddress = this.objectService.locationMasterList.filter(r => r.id === this.objectService.objectHeader.toLocationId).flatMap(r => r.shippingInfo);
        }
      }
      this.selectedAddress = this.availableAddress.find(r => r.isPrimary);
      this.onAddressSelected();
    } catch (e) {
      console.error(e);
    }
  }

  // restrictFields: any = {};
  restrictTrxFields: any = {};
  originalRestrictTrxFields: any = {};
  loadRestrictColumms() {
    try {
      let restrictedObject = {};
      let restrictedTrx = {};
      this.authService.restrictedColumn$.subscribe(obj => {
        let apiData = obj.filter(x => x.moduleName == "SM" && x.objectName == "Quotation").map(y => y.fieldName);

        let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "QuotationLine").map(y => y.fieldName);
        trxDataColumns.forEach(element => {
          restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
        });
        this.restrictTrxFields = restrictedTrx;
        this.originalRestrictTrxFields = JSON.parse(JSON.stringify(this.restrictTrxFields));
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #region  modal to edit each item */

  isModalOpen: boolean = false;
  selectedItem: TransactionDetail;
  selectedIndex: number;
  showEditModal(data: TransactionDetail, rowIndex: number) {
    this.selectedItem = JSON.parse(JSON.stringify(data));
    // this.selectedItem = data;
    this.selectedIndex = rowIndex;
    this.isModalOpen = true;
  }

  saveChanges() {
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
        this.objectService.objectDetail[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
        this.hideEditModal();
        if (this.selectedItem.isPricingApproval) {
          this.objectService.objectHeader.isPricingApproval = true;
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
    if (this.objectService.salesActivatePromotionEngine) {
      await this.promotionEngineService.runPromotionEngine(this.objectService.objectDetail.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax, this.objectService.discountGroupMasterList, false)
    }
  }

  /* #endregion */

  /* #region  edit qty */

  computeQty() {
    try {
      if (this.selectedItem.variationTypeCode == "1" || this.selectedItem.variationTypeCode == "2") {
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

  increaseVariationQty(data: InnerVariationDetail) {
    try {
      data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      this.computeQty();
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  extra info e.g. shipping and address */

  isExtraInfoModal: boolean = false;
  showExtraInfo() {
    this.isExtraInfoModal = true;
  }

  hideExtraInfo() {
    this.isExtraInfoModal = false;
  }

  selectedAddress: ShippingInfo;
  onAddressSelected() {
    try {
      if (this.selectedAddress) {
        this.objectService.objectHeader.shipAddress = this.selectedAddress.address;
        this.objectService.objectHeader.shipPostCode = this.selectedAddress.postCode;
        this.objectService.objectHeader.shipPhone = this.selectedAddress.phone;
        this.objectService.objectHeader.shipEmail = this.selectedAddress.email;
        this.objectService.objectHeader.shipFax = this.selectedAddress.fax;
        this.objectService.objectHeader.shipAreaId = this.selectedAddress.areaId;
        this.objectService.objectHeader.attention = this.selectedAddress.attention;
      } else {
        this.objectService.objectHeader.shipAddress = null;
        this.objectService.objectHeader.shipPostCode = null;
        this.objectService.objectHeader.shipPhone = null;
        this.objectService.objectHeader.shipEmail = null;
        this.objectService.objectHeader.shipFax = null;
        this.objectService.objectHeader.shipAreaId = null;
        this.objectService.objectHeader.attention = null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  delete item */

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
      await this.objectService.objectDetail.splice(index, 1);
      if (this.objectService.salesActivatePromotionEngine) {
        await this.promotionEngineService.runPromotionEngine(this.objectService.objectDetail.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax, this.objectService.discountGroupMasterList, false)
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  unit price, tax, discount */

  computeUnitPriceExTax(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
    try {
      trxLine.unitPrice = parseFloat(parseFloat(stringValue).toFixed(this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax));
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
    try {
      trxLine.unitPriceExTax = parseFloat(parseFloat(stringValue).toFixed(this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax));
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSalesUnitPrice.localMax : this.objectService.precisionSalesUnitPrice.foreignMax);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax);
    } catch (e) {
      console.error(e);
    }
  }

  onDiscCodeChanged(trxLine: TransactionDetail, event: any) {
    try {
      let discPct = this.objectService.discountGroupMasterList.find(x => x.code === event.detail.value).attribute1
      if (discPct) {
        if (discPct == "0") {
          trxLine.discountExpression = null;
        } else {
          trxLine.discountExpression = discPct + "%";
        }
        this.computeAllAmount(trxLine);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async computeAllAmount(data: TransactionDetail) {
    data.qtyRequest = Number(data.qtyRequest.toFixed(0));
    try {
      if (data.qtyRequest <= 0) {
        this.toastService.presentToast("Control Error", "Invalid quantity", "top", "warning", 1000);
      } else {
        if (this.objectService.salesActivatePromotionEngine) {
          await this.promotionEngineService.runPromotionEngine(this.objectService.objectDetail.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.objectService.systemWideActivateTaxControl, this.objectService.objectHeader.isItemPriceTaxInclusive, this.objectService.objectHeader.isDisplayTaxInclusive, this.objectService.objectHeader.isHomeCurrency ? this.objectService.precisionSales.localMax : this.objectService.precisionSales.foreignMax, this.objectService.discountGroupMasterList, true)
        }
      }
      this.computeDiscTaxAmount(data);
    } catch (e) {
      console.error(e);
    }
  }

  getPromoDesc(promoEventId: number) {
    if (this.objectService.promotionMaster.length > 0) {
      let find = this.objectService.promotionMaster.find(x => x.promoEventId == promoEventId);
      if (find) {
        return find.description;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /* #endregion */

  /* #region  step */

  previousStep() {
    try {
      this.navController.navigateBack("/transactions/quotation/quotation-item");
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      this.submit_attempt = true;
      if (this.objectService.objectDetail.length > 0) {
        const alert = await this.alertController.create({
          header: "Are you sure to proceed?",
          buttons: [
            {
              text: "OK",
              role: "confirm",
              cssClass: "success",
              handler: async () => {
                if (this.objectService.objectHeader.quotationId) {
                  await this.updateObject();
                } else {
                  await this.insertObject();
                }
              },
            },
            {
              text: "Cancel",
              cssClass: "cancel",
              role: "cancel",
              handler: async () => {
                this.submit_attempt = false;
              }
            },
          ],
        });
        await alert.present();
      } else {
        this.submit_attempt = false;
        this.toastService.presentToast("Error!", "Please add at least 1 item to continue", "top", "danger", 1000);
      }
    } catch (e) {
      this.submit_attempt = false;
      console.error(e);
    } finally {
      this.submit_attempt = false;
    }
  }

  async insertObject() {
    try {
      await this.loadingService.showLoading();
      let trxDto: QuotationRoot = {
        header: this.objectService.objectHeader,
        details: this.objectService.objectDetail
      }
      trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
      this.objectService.insertObject(trxDto).subscribe(async response => {
        let object = response.body;
        await this.objectService.setSummary(object);
        await this.loadingService.dismissLoading();
        this.toastService.presentToast("", "Insert Complete", "top", "success", 1000);
        this.navController.navigateRoot("/transactions/quotation/quotation-summary");
      }, async error => {
        this.submit_attempt = false;
        await this.loadingService.dismissLoading();
        console.error(error);
      });
    } catch (e) {
      this.submit_attempt = false;
      await this.loadingService.dismissLoading();
      console.error(e);
    } finally {
      this.submit_attempt = false;
      await this.loadingService.dismissLoading();
    }
  }

  async updateObject() {
    try {
      await this.loadingService.showLoading();
      let trxDto: QuotationRoot = {
        header: this.objectService.objectHeader,
        details: this.objectService.objectDetail
      }
      trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
      this.objectService.updateObject(trxDto).subscribe(async response => {
        let object = response.body;
        await this.objectService.setSummary(object);
        await this.loadingService.dismissLoading();
        this.toastService.presentToast("Update Complete", "", "top", "success", 1000);
        this.navController.navigateRoot("/transactions/quotation/quotation-summary");
      }, async error => {
        await this.loadingService.dismissLoading();
        this.submit_attempt = false;
        console.error(error);
      });
    } catch (e) {
      await this.loadingService.dismissLoading();
      this.submit_attempt = false;
      console.error(e);
    } finally {
      await this.loadingService.dismissLoading();
      this.submit_attempt = false;
    }
  }

  /* #endregion */

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  checkPricingApprovalLines(trxDto: QuotationRoot, trxLineArray: TransactionDetail[]) {
    let filteredData = trxLineArray.filter(x => x.unitPrice != x.oriUnitPrice || x.unitPriceExTax != x.oriUnitPriceExTax || x.discountGroupCode != x.oriDiscountGroupCode || x.discountExpression != x.oriDiscountExpression);
    filteredData = filteredData.filter(x => !x.isPromoImpactApplied);
    if (filteredData.length > 0) {
      filteredData.forEach(x => { x.isPricingApproval = true });
      trxDto.header.isPricingApproval = true;
    } else {
      trxDto.header.isPricingApproval = false;
    }
    return trxDto;
  }

  onPricingApprovalSwitch(event: any) {
    if (event.detail.checked) {
      switch (this.objectService.orderingPriceApprovalEnabledFields) {
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
      if (this.restrictTrxFields.unitPrice == false) {
        this.restrictTrxFields.unitPrice = true;
      }
      if (this.restrictTrxFields.unitPriceExTax == false) {
        this.restrictTrxFields.unitPriceExTax = true;
      }
      if (this.restrictTrxFields.discountExpression == false) {
        this.restrictTrxFields.discountExpression = true;
      }
      if (this.restrictTrxFields.discountGroupCode == false) {
        this.restrictTrxFields.discountGroupCode = true;
      }
    }
  }

  /* #endregion */

}
