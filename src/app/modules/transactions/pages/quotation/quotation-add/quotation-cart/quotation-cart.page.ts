import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { QuotationHeader, QuotationRoot, QuotationSummary } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails, ShippingInfo } from 'src/app/shared/models/master-list-details';
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
export class QuotationCartPage implements OnInit {

  objectHeader: QuotationHeader;
  itemInCart: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    private quotationService: QuotationService,
    private commonService: CommonService,
    private promotionEngineService: PromotionEngineService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectHeader = this.quotationService.header;
    this.itemInCart = this.quotationService.itemInCart;
    this.loadModuleControl();
    this.loadMasterList();
    this.loadRestrictColumms();
    this.loadPromotion();
  }

  availableAddress: ShippingInfo[] = [];
  shippingInfo: ShippingInfo;
  loadAvailableAddresses() {
    try {
      this.availableAddress = [];
      if (this.objectHeader) {
        if (this.objectHeader.businessModelType === 'T') {
          this.availableAddress = this.customerMasterList.filter(r => r.id === this.objectHeader.customerId).flatMap(r => r.shippingInfo);
        } else {
          this.availableAddress = this.locationMasterList.filter(r => r.id === this.objectHeader.toLocationId).flatMap(r => r.shippingInfo);
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

  customerMasterList: MasterListDetails[] = [];
  discountGroupMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  shipMethodMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  areaMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.quotationService.getMasterList().subscribe(response => {
        this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.discountGroupMasterList = response.filter(x => x.objectName == 'DiscountGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.shipMethodMasterList = response.filter(x => x.objectName == 'ShipMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.areaMasterList = response.filter(x => x.objectName == 'Area').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.loadAvailableAddresses();
      }, error => {
        throw error;
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
        console.log("🚀 ~ file: quotation-cart.page.ts:130 ~ QuotationCartPage ~ loadRestrictColumms ~ obj:", obj)
        // let apiData = obj.filter(x => x.moduleName == "SM" && x.objectName == "SalesOrder").map(y => y.fieldName);
        // apiData.forEach(element => {
        //   Object.keys(this.objectForm.controls).forEach(ctrl => {
        //     if (element.toUpperCase() === ctrl.toUpperCase()) {
        //       restrictedObject[ctrl] = true;
        //     }
        //   });
        // });
        // this.restrictFields = restrictedObject;
  
        let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "QuotationLine").map(y => y.fieldName);
        trxDataColumns.forEach(element => {
          restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
        });
        this.restrictTrxFields = restrictedTrx;
        console.log("🚀 ~ file: quotation-cart.page.ts:145 ~ QuotationCartPage ~ loadRestrictColumms ~ this.restrictTrxFields:", this.restrictTrxFields)
      })      
    } catch (e) {
      console.error(e);
    }
  }

  loadPromotion() {
    try {
      let trxDate = this.objectHeader.trxDate;
      if (trxDate) {
        this.quotationService.getPromotion(format(new Date(trxDate), 'yyyy-MM-dd'), this.objectHeader.customerId).subscribe(response => {
          this.promotionMaster = response;
        }, error => {
          throw error;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  /* #region  modal to edit each item */

  isModalOpen: boolean = false;
  selectedItem: TransactionDetail;
  showEditModal(data: TransactionDetail) {
    this.selectedItem = data;
    this.isModalOpen = true;
  }

  hideEditModal() {
    this.isModalOpen = false;
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
    let index = this.itemInCart.findIndex(r => r.itemId === data.itemId);
    if (index > -1) {
      this.itemInCart.splice(index, 1);
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
      let discPct = this.discountGroupMasterList.find(x => x.code === event.detail.value).attribute1
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
        this.promotionEngineService.runPromotionEngine(this.itemInCart.filter(x => x.qtyRequest > 0), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision, this.discountGroupMasterList, true)
      }
    } catch (e) {
      console.error(e);
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
      if (this.itemInCart.length > 0) {
        const alert = await this.alertController.create({
          header: 'Are you sure to proceed?',
          buttons: [
            {
              text: 'OK',
              role: 'confirm',
              cssClass: 'success',
              handler: async () => {
                await this.insertQuotation();
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

  insertQuotation() {
    try {
      let trxDto: QuotationRoot = {
        header: this.objectHeader,
        details: this.itemInCart
      }
      this.quotationService.insertObject(trxDto).subscribe(response => {
        let details: any[] = response.body["details"];
        let totalQty: number = 0;
        details.forEach(e => {
          totalQty += e.qtyRequest;
        })
        let qs: QuotationSummary = {
          quotationNum: response.body["header"]["quotationNum"],
          customerName: this.customerMasterList.find(r => r.id === response.body["header"]["customerId"]).description,
          totalQuantity: totalQty,
          totalAmount: response.body["header"]["grandTotal"]
        }
        this.quotationService.setQuotationSummary(qs);
        this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/quotation/quotation-summary');
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
