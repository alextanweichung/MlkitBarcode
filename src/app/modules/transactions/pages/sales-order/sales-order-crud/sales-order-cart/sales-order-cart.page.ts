
import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonDatetime, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { SalesOrderRoot } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { DraftTransaction } from 'src/app/shared/models/draft-transaction';
import { ShippingInfo } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';

@Component({
  selector: 'app-sales-order-cart',
  templateUrl: './sales-order-cart.page.html',
  styleUrls: ['./sales-order-cart.page.scss'],
})
export class SalesOrderCartPage implements OnInit, ViewWillEnter {

  moduleControl: ModuleControl[] = [];
  promotionEngineApplicable: boolean = true;
  useTax: boolean = false;

  submit_attempt: boolean = false;

  inputType: string = "number";

  constructor(
    private authService: AuthService,
    public objectService: SalesOrderService,
    private commonService: CommonService,
    private promotionEngineService: PromotionEngineService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController
  ) {
    if (Capacitor.getPlatform() === "android") {
      this.inputType = "number";
    }
    if (Capacitor.getPlatform() === "ios") {
      this.inputType = "tel";
    }
    this.objectService.loadRequiredMaster();
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
    }
  }

  ionViewWillEnter(): void {
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
    }
    if (this.objectService.header.deliveryDate) {
      this.dateValue = format(new Date(this.objectService.header.deliveryDate), "yyyy-MM-dd") + "T08:00:00.000Z";
      this.setFormattedDateString();
    }
  }

  ngOnInit() {
    this.loadModuleControl();
    this.loadRestrictColumms();
    this.loadAvailableAddresses();
  }

  availableAddress: ShippingInfo[] = [];
  shippingInfo: ShippingInfo;
  loadAvailableAddresses() {
    try {
      this.availableAddress = [];
      if (this.objectService.header) {
        if (this.objectService.header.businessModelType === 'T') {
          this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectService.header.customerId).flatMap(r => r.shippingInfo);
        } else {
          this.availableAddress = this.objectService.locationMasterList.filter(r => r.id === this.objectService.header.toLocationId).flatMap(r => r.shippingInfo);
        }
      }
      if (this.objectService.header.salesOrderId === 0) { // only do this when new sales-order
        this.selectedAddress = this.availableAddress.find(r => r.isPrimary);
        this.onAddressSelected();
      }
    } catch (e) {
      console.error(e);
    }
  }

  orderingPriceApprovalEnabledFields: string = "0"
  salesOrderQuantityControl: string = "0";
  configSalesActivatePromotionEngine: boolean;
  configOrderingActivateMOQControl: boolean;
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
        let salesOrderQuantityControl = this.moduleControl.find(x => x.ctrlName === "SalesOrderQuantityControl");
        if (salesOrderQuantityControl) {
          this.salesOrderQuantityControl = salesOrderQuantityControl.ctrlValue;
        }
        let priceApprovalEnabledFields = this.moduleControl.find(x => x.ctrlName === "OrderingPriceApprovalEnabledFields");
        if (priceApprovalEnabledFields) {
          this.orderingPriceApprovalEnabledFields = priceApprovalEnabledFields.ctrlValue;
        }
        let moqCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateMOQControl");
        if (moqCtrl && moqCtrl.ctrlValue.toUpperCase() == 'Y') {
          this.configOrderingActivateMOQControl = true;
        } else {
          this.configOrderingActivateMOQControl = false;
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

  // restrictFields: any = {};
  restrictTrxFields: any = {};
  originalRestrictTrxFields: any = {};
  loadRestrictColumms() {
    try {
      let restrictedObject = {};
      let restrictedTrx = {};
      this.authService.restrictedColumn$.subscribe(obj => {
        let apiData = obj.filter(x => x.moduleName == "SM" && x.objectName == "SalesOrder").map(y => y.fieldName);
        let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "SalesOrderLine").map(y => y.fieldName);
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
    this.selectedIndex = rowIndex;
    this.isModalOpen = true;
  }

  hideEditModal() {
    this.isModalOpen = false;
  }

  onModalHide() {
    this.selectedIndex = null;
    this.selectedItem = null;
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
    }
  }

  saveChanges() {
    if (this.selectedIndex === null || this.selectedIndex === undefined) {
      this.toastService.presentToast("System Error", "Please contact Administrator.", "top", "danger", 1000);
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
        this.selectedItem.qtyRequest = totalQty;
        this.computeAllAmount(this.selectedItem);
      }
      if (hasQtyError) {
        this.toastService.presentToast("", "Invalid Quantity.", "top", "warning", 1000);
      } else {
        // let validMinOrderQty = this.validateMinOrderQty(this.selectedItem);
        // if (validMinOrderQty) {
          this.objectService.itemInCart[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
          this.hideEditModal();
          if (this.selectedItem.isPricingApproval) {
            this.objectService.header.isPricingApproval = true;
          }
        // }
      }
    }
  }

  async cancelChanges() {
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to discard changes?',
        buttons: [
          {
            text: 'OK',
            role: 'confirm',
            cssClass: 'success',
            handler: () => {
              this.isModalOpen = false;
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
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
                this.toastService.presentToast('Error', 'Invalid Quantity.', 'top', 'warning', 1000);
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
        data.qtyRequest = null;
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
      if (this.salesOrderQuantityControl == '1') {
        if (((data.qtyRequest ?? 0) + 1) > data.actualQty) {
          data.qtyRequest = null;
          this.toastService.presentToast('Invalid Quantity', `Requested quantity exceeded actual quantity [${data.actualQty}]`, 'top', 'warning', 1000);
        } else {
          data.qtyRequest = (data.qtyRequest ?? 0) + 1;
        }
      } else if (this.salesOrderQuantityControl == '2') {
        if (((data.qtyRequest ?? 0) + 1) > data.availableQty) {
          data.qtyRequest = null;
          this.toastService.presentToast('Invalid Quantity', `Requested quantity exceeded available quantity [${data.availableQty}]`, 'top', 'warning', 1000);
        } else {
          data.qtyRequest = (data.qtyRequest ?? 0) + 1;
        }
      } else {
        data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      }
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
        this.objectService.header.shipAddress = this.selectedAddress.address;
        this.objectService.header.shipPostCode = this.selectedAddress.postCode;
        this.objectService.header.shipPhone = this.selectedAddress.phone;
        this.objectService.header.shipEmail = this.selectedAddress.email;
        this.objectService.header.shipFax = this.selectedAddress.fax;
        this.objectService.header.shipAreaId = this.selectedAddress.areaId;
        this.objectService.header.attention = this.selectedAddress.attention;
      }
    } catch (e) {
      console.error(e);
    }
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

  /* #region  delete item */

  async presentDeleteItemAlert(data: TransactionDetail, index: number) {
    // try {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Are you sure to delete?',
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          cssClass: 'danger',
          handler: async () => {
            await this.removeItem(data, index);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
      ],
    });
    await alert.present();
    // } catch (e) {
    //   console.error(e);
    // }
  }

  removeItem(data: TransactionDetail, index: number) {
    // remove item = set qtyRequest = 0 for validateMinOrderQty
    // let tempData = JSON.parse(JSON.stringify(data));
    // tempData.qtyRequest = 0;
    // let validMinOrderQty = this.validateMinOrderQty(tempData);
    // if (validMinOrderQty) {
      setTimeout(() => {
        this.objectService.itemInCart.splice(index, 1);
        this.toastService.presentToast("", "Line removed.", "top", "success", 1000);
      }, 1);
      if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
        this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
      }
    // }
  }

  /* #endregion */

  /* #region  unit price, tax, discount */

  computeUnitPriceExTax(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
    try {
      trxLine.unitPrice = parseFloat(parseFloat(stringValue).toFixed(2));
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectService.header.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail, stringValue: string) { // special handle for iPhone, cause no decimal point
    try {
      trxLine.unitPriceExTax = parseFloat(parseFloat(stringValue).toFixed(2));
      trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.objectService.header.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision);
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

  computeAllAmount(data: TransactionDetail) {
    data.qtyRequest = Number(data.qtyRequest.toFixed(0));
    try {
      if (this.salesOrderQuantityControl == '1') {
        if (data.qtyRequest && data.qtyRequest > data.actualQty) {
          data.qtyRequest = null;
          this.toastService.presentToast('Invalid Quantity', `Requested quantity exceeded actual quantity [${data.actualQty}]`, 'top', 'warning', 1000);
        }
      } else if (this.salesOrderQuantityControl == '2') {
        if (data.qtyRequest && data.qtyRequest > data.availableQty) {
          data.qtyRequest = null;
          this.toastService.presentToast('Invalid Quantity', `Requested quantity exceeded available quantity [${data.availableQty}]`, 'top', 'warning', 1000);
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
      this.navController.navigateBack('/transactions/sales-order/sales-order-item');
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      this.submit_attempt = true;
      if (this.objectService.itemInCart.length > 0) {
        // let validMinOrderQty = this.validateMinOrderQty();
        // if (validMinOrderQty) {
          const alert = await this.alertController.create({
            header: "Are you sure to proceed?",
            subHeader: (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) ? "This will delete Draft & Generate SO" : "",
            buttons: [
              {
                text: 'OK',
                cssClass: 'success',
                role: 'confirm',
                handler: async () => {
                  if (this.objectService.header.salesOrderId > 0) {
                    await this.updateObject();
                  } else {
                    await this.insertObject();
                  }
                },
              },
              {
                text: 'Cancel',
                cssClass: 'cancel',
                role: 'cancel',
                handler: async () => {
                  this.submit_attempt = false;
                }
              },
            ],
          });
          await alert.present();
        // }
      } else {
        this.submit_attempt = false;
        this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1000);
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
      let trxDto: SalesOrderRoot = {
        header: this.objectService.header,
        details: this.objectService.itemInCart
      }
      trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
      trxDto.header.salesOrderNum = null; // always default to null when insert
      if (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) {
        this.objectService.confirmDraftObject(this.objectService.draftObject.draftTransactionId, trxDto).subscribe(response => {
          this.objectService.setObject((response.body as SalesOrderRoot));
          this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
          this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
        }, error => {
          console.error(error);
        })
      } else {
        this.objectService.insertObject(trxDto).subscribe(response => {
          this.objectService.setObject((response.body as SalesOrderRoot));
          this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
          this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
        }, error => {
          this.submit_attempt = false;
          console.error(error);
        })
      }
    } catch (e) {
      this.submit_attempt = false;
      console.error(e);
    } finally {
      this.submit_attempt = false;
    }
  }

  async updateObject() {
    try {
      let trxDto: SalesOrderRoot = {
        header: this.objectService.header,
        details: this.objectService.itemInCart,
      }
      trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
      this.objectService.updateObject(trxDto).subscribe(response => {
        this.objectService.setObject((response.body as SalesOrderRoot));
        this.toastService.presentToast('Update Complete', '', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
      }, error => {
        this.submit_attempt = false;
        throw error;
      });
    } catch (e) {
      this.submit_attempt = false;
      console.error(e);
    } finally {
      this.submit_attempt = false;
    }
  }

  /* #endregion */

  /* #region draft step */

  async nextStepDraft() {
    try {
      this.submit_attempt = true;
      if (this.objectService.itemInCart.length > 0) {
        const alert = await this.alertController.create({
          header: "Save as Draft?",
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                if (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) {
                  await this.updateObjectAsDraft();
                } else {
                  await this.insertObjectAsDraft();
                }
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel',
              handler: async () => {
                this.submit_attempt = false;
              }
            },
          ],
        });
        await alert.present();
      } else {
        this.submit_attempt = false;
        this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1000);
      }
    } catch (e) {
      this.submit_attempt = false;
      console.error(e);
    }
  }

  insertObjectAsDraft() {
    try {
      let trxDto: SalesOrderRoot = {
        header: this.objectService.header,
        details: this.objectService.itemInCart
      }
      trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
      let object: DraftTransaction = {
        draftTransactionId: 0,
        draftTransactionNum: null,
        transactionType: "SALESORDER",
        jsonData: JSON.stringify(trxDto)
      }

      this.objectService.insertDraftObject(object).subscribe(response => {
        this.submit_attempt = false;
        let ret: DraftTransaction = response.body as DraftTransaction;
        let soObj = JSON.parse(ret.jsonData) as SalesOrderRoot;
        soObj.header.salesOrderNum = ret.draftTransactionNum;
        this.objectService.setObject(soObj);
        this.toastService.presentToast('Insert Draft Complete', '', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
      }, error => {
        this.submit_attempt = false;
        throw error;
      });
    } catch (e) {
      this.submit_attempt = false;
      console.error(e);
    } finally {
      this.submit_attempt = false;
    }
  }

  updateObjectAsDraft() {
    try {
      let trxDto: SalesOrderRoot = {
        header: this.objectService.header,
        details: this.objectService.itemInCart
      }
      trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
      this.objectService.draftObject.jsonData = JSON.stringify(trxDto);
      this.objectService.updateDraftObject(this.objectService.draftObject).subscribe(response => {
        this.submit_attempt = false;
        let ret: DraftTransaction = response.body as DraftTransaction
        this.objectService.setObject(JSON.parse(ret.jsonData) as SalesOrderRoot);
        this.toastService.presentToast('Update Draft Complete', '', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
      }, error => {
        this.submit_attempt = false;
        throw error;
      });
    } catch (e) {
      this.submit_attempt = false;
      console.error(e);
    } finally {
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

  checkPricingApprovalLines(trxDto: SalesOrderRoot, trxLineArray: TransactionDetail[]) {
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

  updateIsPriorityDate() {
    if (this.objectService.header.isPriority) {
      this.objectService.header.isPriorityDate = this.commonService.convertUtcDate(new Date());
    } else {
      this.objectService.header.isPriorityDate = null
    }
  }

  /* #region calendar handle here */

  formattedDateString: string = "";
  dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
  @ViewChild("datetime") datetime: IonDatetime
  setFormattedDateString() {
    this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
  }

  onTrxDateSelected(value: any) {
    this.dateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
    this.setFormattedDateString();
    this.objectService.header.deliveryDate = new Date(format(new Date(value), 'yyyy-MM-dd') + "T00:00:00.000Z");
  }

  dateDismiss() {
    this.objectService.header.deliveryDate = null;
    this.datetime.cancel(true);
  }

  dateSelect() {
    this.datetime.confirm(true);
  }

  /* #endregion */

  /* #region check min order qty */

  validateMinOrderQty() {
    if (this.configOrderingActivateMOQControl) {
      if (this.objectService.header.businessModelType === "T" || this.objectService.header.businessModelType === "B") {


        // if (data.qtyRequest !== null && data.minOrderQty && data.qtyRequest < data.minOrderQty) {
        //   let sameItemInCart = this.objectService.itemInCart.filter(r => r.itemId === data.itemId && r.uuid !== data.uuid);
        //   console.log("🚀 ~ file: sales-order-cart.page.ts:814 ~ SalesOrderCartPage ~ validateMinOrderQty ~ sameItemInCart:", sameItemInCart)
        //   let totalQtyRequestOfSameItemInCart = sameItemInCart.flatMap(r => (r.qtyRequest ?? 0)).reduce((a, c) => (a + c), 0);
        //   console.log("🚀 ~ file: sales-order-cart.page.ts:815 ~ SalesOrderCartPage ~ validateMinOrderQty ~ totalQtyRequestOfSameItemInCart:", totalQtyRequestOfSameItemInCart)
        //   if (sameItemInCart && totalQtyRequestOfSameItemInCart > 0) {
        //     // check if qtyincart has same item if yes then check minorderqty again
        //     if (data.qtyRequest !== null && data.minOrderQty && (data.qtyRequest + totalQtyRequestOfSameItemInCart) < data.minOrderQty) {
        //       this.toastService.presentToast("Invalid Quantity", "Total requested quantity [" + Number(data.qtyRequest + totalQtyRequestOfSameItemInCart) + "] is lower than minimum order quantity [" + data.minOrderQty + "]", "top", "warning", 1000);
        //       setTimeout(() => {
        //         data.qtyRequest = saveQtyReq;
        //         return false;
        //       }, 10);
        //     } else {
        //       return true;
        //     }
        //   } else {
        //     this.toastService.presentToast("Invalid Quantity", "Total requested quantity [" + Number(data.qtyRequest + totalQtyRequestOfSameItemInCart) + "] is lower than minimum order quantity [" + data.minOrderQty + "]", "top", "warning", 1000);
        //     setTimeout(() => {
        //       data.qtyRequest = saveQtyReq;
        //       return false;
        //     }, 10);
        //   }
        // } else {
        //   return true;
        // }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  /* #endregion */

}
