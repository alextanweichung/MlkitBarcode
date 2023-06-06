import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { QuotationHeader, QuotationRoot } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ShippingInfo } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
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
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    public objectService: QuotationService,
    private commonService: CommonService,
    private promotionEngineService: PromotionEngineService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController
  ) {
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
    }
  }

  ionViewWillEnter(): void {
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
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
      this.selectedAddress = this.availableAddress.find(r => r.isPrimary);
      this.onAddressSelected();
    } catch (e) {
      console.error(e);
    }
  }

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
        let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "QuotationLine").map(y => y.fieldName);
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
      this.objectService.itemInCart[this.selectedIndex] = JSON.parse(JSON.stringify(this.selectedItem));
      this.hideEditModal();
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
      this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
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
        this.objectService.header.shipAddress = this.selectedAddress.address;
        this.objectService.header.shipPostCode = this.selectedAddress.postCode;
        this.objectService.header.shipPhone = this.selectedAddress.phone;
        this.objectService.header.shipEmail = this.selectedAddress.email;
        this.objectService.header.shipFax = this.selectedAddress.fax;
        this.objectService.header.shipAreaId = this.selectedAddress.areaId;
        this.objectService.header.attention = this.selectedAddress.attention;
      } else {
        this.objectService.header.shipAddress = null;
        this.objectService.header.shipPostCode = null;
        this.objectService.header.shipPhone = null;
        this.objectService.header.shipEmail = null;
        this.objectService.header.shipFax = null;
        this.objectService.header.shipAreaId = null;
        this.objectService.header.attention = null;
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
      let index = this.objectService.itemInCart.findIndex(r => r.itemId === data.itemId);
      if (index > -1) {
        this.objectService.itemInCart = [...this.objectService.itemInCart.filter(r => r.itemId !== data.itemId)];
      }
      if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
        this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.objectService.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, false)
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  unit price, tax, discount */

  computeUnitPriceExTax(trxLine: TransactionDetail) {
    try {
      trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectService.header.maxPrecision);
      this.computeDiscTaxAmount(trxLine);
    } catch (e) {
      console.error(e);
    }
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    try {
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

  promotionEngineApplicable: boolean = true;
  promotionMaster: PromotionMaster[] = [];
  computeAllAmount(trxLine: TransactionDetail) {
    try {
      if (trxLine.qtyRequest <= 0) {
        trxLine.qtyRequest = 1;
        this.toastService.presentToast('Error', 'Invalid qty.', 'top', 'danger', 1000);
      }
      this.computeDiscTaxAmount(trxLine);
      if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
        this.promotionEngineService.runPromotionEngine(this.objectService.itemInCart.filter(x => x.qtyRequest > 0), this.promotionMaster, this.useTax, this.objectService.header.isItemPriceTaxInclusive, this.objectService.header.isDisplayTaxInclusive, this.objectService.header.maxPrecision, this.objectService.discountGroupMasterList, true)
      }
    } catch (e) {
      console.error(e);
    }
  }  

  getPromoDesc(promoEventId: number) {
    if (this.promotionMaster.length > 0) {
      let find = this.promotionMaster.find(x => x.promoEventId == promoEventId);
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
      this.navController.navigateBack('/transactions/quotation/quotation-item');
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      if (this.objectService.itemInCart.length > 0) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          buttons: [
            {
              text: 'OK',
              role: 'confirm',
              cssClass: 'success',
              handler: async () => {
                if (this.objectService.header.quotationId) {
                  await this.updateObject();
                } else {
                  await this.insertObject();
                }
              },
            },
            {
              text: 'Cancel',
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
      let trxDto: QuotationRoot = {
        header: this.objectService.header,
        details: this.objectService.itemInCart
      }
      this.objectService.insertObject(trxDto).subscribe(response => {
        this.objectService.setObject((response.body as QuotationRoot))
        this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/quotation/quotation-summary');
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

  updateObject() {
    let trxDto: QuotationRoot = {
      header: this.objectService.header,
      details: this.objectService.itemInCart
    }
    this.objectService.updateObject(trxDto).subscribe(response => {
      this.objectService.setObject((response.body as QuotationRoot));
      this.toastService.presentToast('Update Complete', '', 'top', 'success', 1000);
      this.navController.navigateRoot('/transactions/quotation/quotation-summary');
    }, error => {
      throw error;
    });
  } catch(e) {
    console.error(e);
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
