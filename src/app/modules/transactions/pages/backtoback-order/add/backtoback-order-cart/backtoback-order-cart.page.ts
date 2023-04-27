import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { BackToBackOrderHeader, BackToBackOrderRoot } from 'src/app/modules/transactions/models/backtoback-order';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ShippingInfo } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';

@Component({
  selector: 'app-backtoback-order-cart',
  templateUrl: './backtoback-order-cart.page.html',
  styleUrls: ['./backtoback-order-cart.page.scss'],
})
export class BacktobackOrderCartPage implements OnInit, ViewWillEnter {

  objectHeader: BackToBackOrderHeader;
  itemInCart: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];
  promotionEngineApplicable: boolean = true;
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    public objectService: BackToBackOrderService,
    private commonService: CommonService,
    private promotionEngineService: PromotionEngineService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController
  ) {
    this.objectHeader = this.objectService.objectHeader;
    this.itemInCart = this.objectService.itemInCart;
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision, this.objectService.discountGroupMasterList, false)
    }
  }

  ionViewWillEnter(): void {
    this.objectHeader = this.objectService.objectHeader;
    this.itemInCart = this.objectService.itemInCart;
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision, this.objectService.discountGroupMasterList, false)
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
      if (this.objectHeader) {
        if (this.objectHeader.businessModelType === 'T') {
          this.availableAddress = this.objectService.customerMasterList.filter(r => r.id === this.objectHeader.customerId).flatMap(r => r.shippingInfo);
        } else {
          this.availableAddress = this.objectService.locationMasterList.filter(r => r.id === this.objectHeader.toLocationId).flatMap(r => r.shippingInfo);
        }
      }
      this.selectedAddress = this.availableAddress.find(r => r.isPrimary);
      this.onAddressSelected();      
    } catch (e) {
      console.error(e);
    }
  }

  salesOrderQuantityControl: string = "0";
  configSalesActivatePromotionEngine: boolean;
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
  loadRestrictColumms() {
    try {
      let restrictedObject = {};
      let restrictedTrx = {};
      this.authService.restrictedColumn$.subscribe(obj => {  
        let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "SalesOrderLine").map(y => y.fieldName);
        trxDataColumns.forEach(element => {
          restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
        });
        this.restrictTrxFields = restrictedTrx;
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
      this.toastService.presentToast("System Error", "Please contact Administrator.", "top", "danger", 1000);
      return;
    } else {
      if ((this.selectedItem.qtyRequest??0)<= 0) {
        this.toastService.presentToast("Invalid Qty", "", "top", "warning", 1000);
      } else {
        this.itemInCart[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
        this.hideEditModal();
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

  hideEditModal() {
    this.isModalOpen = false;
  }

  onModalHide() {
    this.selectedIndex = null;
    this.selectedItem = null;
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision, this.objectService.discountGroupMasterList, false)
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
                y.qtyRequest = 1;
                this.toastService.presentToast('Error', 'Invalid qty.', 'top', 'danger', 1000);
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
        this.objectHeader.shipAddress = this.selectedAddress.address;
        this.objectHeader.shipPostCode = this.selectedAddress.postCode;
        this.objectHeader.shipPhone = this.selectedAddress.phone;
        this.objectHeader.shipEmail = this.selectedAddress.email;
        this.objectHeader.shipFax = this.selectedAddress.fax;
        this.objectHeader.shipAreaId = this.selectedAddress.areaId;
        this.objectHeader.attention = this.selectedAddress.attention;
      } else {
        this.objectHeader.shipAddress = null;
        this.objectHeader.shipPostCode = null;
        this.objectHeader.shipPhone = null;
        this.objectHeader.shipEmail = null;
        this.objectHeader.shipFax = null;
        this.objectHeader.shipAreaId = null;
        this.objectHeader.attention = null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  delete item */

  async presentDeleteItemAlert(data: TransactionDetail) {
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to delete?',
        buttons: [
          {
            text: 'OK',
            role: 'confirm',
            cssClass: 'danger',
            handler: () => {
              this.removeItemById(data);
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

  removeItemById(data: TransactionDetail) {
    try {
      let index = this.itemInCart.findIndex(r => r.itemId === data.itemId);
      if (index > -1) {
        this.itemInCart.splice(index, 1);
      }
      if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
        this.promotionEngineService.runPromotionEngine(this.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision, this.objectService.discountGroupMasterList, false)
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  unit price, tax, discount */

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

  computeDiscTaxAmount(trxLine: TransactionDetail) {
    try {
      trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision);
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
      this.navController.navigateBack('/transactions/backtoback-order/backtoback-order-item');
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      if (this.itemInCart.length > 0) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                await this.insertObject();
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } else {
        this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  insertObject() {
    try {
      let trxDto: BackToBackOrderRoot = {
        header: this.objectHeader,
        details: this.itemInCart
      }
      this.objectService.insertObject(trxDto).subscribe(response => {
        let object = response.body as BackToBackOrderRoot;
        this.objectService.setObjectRoot(object);
        this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/backtoback-order/backtoback-order-summary');
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  /* #endregion */

}
