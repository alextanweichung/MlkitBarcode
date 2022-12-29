import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { SalesOrderHeader, SalesOrderRoot, SalesOrderSummary } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ShippingInfo, MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { PromotionMaster } from 'src/app/shared/models/promotion-engine';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { PromotionEngineService } from 'src/app/shared/services/promotion-engine.service';

@Component({
  selector: 'app-sales-order-cart',
  templateUrl: './sales-order-cart.page.html',
  styleUrls: ['./sales-order-cart.page.scss'],
})
export class SalesOrderCartPage implements OnInit {

  objectHeader: SalesOrderHeader;
  itemInCart: TransactionDetail[] = [];

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    private salesOrderService: SalesOrderService,
    private commonService: CommonService,
    private promotionEngineService: PromotionEngineService,
    private toastService: ToastService,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.objectHeader = this.salesOrderService.header;
    this.itemInCart = this.salesOrderService.itemInCart;
    this.loadModuleControl();
    this.loadMasterList();
    this.loadRestrictColumms();
  }

  availableAddress: ShippingInfo[] = [];
  shippingInfo: ShippingInfo;
  loadAvailableAddresses() {
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
  }

  configSalesActivatePromotionEngine: boolean;
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
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
      console.log(error);
    })
    this.authService.precisionList$.subscribe(precision => {
      this.precisionSales = precision.find(x => x.precisionCode == "SALES");
      this.precisionTax = precision.find(x => x.precisionCode == "TAX");
    })
  }

  customerMasterList: MasterListDetails[] = [];
  discountGroupMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  shipMethodMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  areaMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.salesOrderService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.discountGroupMasterList = response.filter(x => x.objectName == 'DiscountGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.shipMethodMasterList = response.filter(x => x.objectName == 'ShipMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.areaMasterList = response.filter(x => x.objectName == 'Area').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.loadAvailableAddresses();
    }, error => {
      console.log(error);
    })
  }

  // restrictFields: any = {};
  restrictTrxFields: any = {};
  loadRestrictColumms() {
    let restrictedObject = {};
    let restrictedTrx = {};
    this.authService.restrictedColumn$.subscribe(obj => {
      // let apiData = obj.filter(x => x.moduleName == "SM" && x.objectName == "SalesOrder").map(y => y.fieldName);
      // apiData.forEach(element => {
      //   Object.keys(this.objectForm.controls).forEach(ctrl => {
      //     if (element.toUpperCase() === ctrl.toUpperCase()) {
      //       restrictedObject[ctrl] = true;
      //     }
      //   });
      // });
      // this.restrictFields = restrictedObject;

      let trxDataColumns = obj.filter(x => x.moduleName == "SM" && x.objectName == "SalesOrderLine").map(y => y.fieldName);
      trxDataColumns.forEach(element => {
        restrictedTrx[this.commonService.toFirstCharLowerCase(element)] = true;
      });
      this.restrictTrxFields = restrictedTrx;
    })
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
    console.log('blur liao meh');
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
  }

  decreaseVariationQty(data: InnerVariationDetail) {
    if ((data.qtyRequest - 1) < 0) {
      data.qtyRequest = 0;
    } else {
      data.qtyRequest -= 1;
    }
    this.computeQty();
  }

  increaseVariationQty(data: InnerVariationDetail) {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
    this.computeQty();
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
  }

  /* #endregion */

  /* #region  delete item */

  async presentDeleteItemAlert(data: TransactionDetail) {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Are you sure to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'OK',
          role: 'confirm',
          cssClass: 'danger',
          handler: () => {
            this.removeItemById(data);
          },
        },
      ],
    });
    await alert.present();
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
    trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.objectHeader.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
  }

  computeUnitPrice(trxLine: TransactionDetail) {
    trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.objectHeader.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
  }

  computeDiscTaxAmount(trxLine: TransactionDetail) {
    trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision);
  }

  onDiscCodeChanged(trxLine: TransactionDetail, event: any) {
    let discPct = this.discountGroupMasterList.find(x => x.code === event.detail.value).attribute1
    if (discPct) {
      if (discPct == "0") {
        trxLine.discountExpression = null;
      } else {
        trxLine.discountExpression = discPct + "%";
      }
      this.computeAllAmount(trxLine);
    }
  }

  promotionEngineApplicable: boolean = true;
  promotionMaster: PromotionMaster[] = [];
  computeAllAmount(trxLine: TransactionDetail) {
    if (trxLine.qtyRequest <= 0) {
      trxLine.qtyRequest = 1;
      this.toastService.presentToast('Error', 'Invalid qty.', 'top', 'danger', 1000);
    }
    this.computeDiscTaxAmount(trxLine);
    // if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine && !this.disablePromotionCheckBox) {
    if (this.promotionEngineApplicable && this.configSalesActivatePromotionEngine) {
      this.promotionEngineService.runPromotionEngine(this.itemInCart.filter(x => x.qtyRequest > 0), this.promotionMaster, this.useTax, this.objectHeader.isItemPriceTaxInclusive, this.objectHeader.isDisplayTaxInclusive, this.objectHeader.maxPrecision, this.discountGroupMasterList, true)
    }
  }

  /* #endregion */

  /* #region  step */

  previousStep() {
    this.navController.navigateBack('/transactions/sales-order/sales-order-item');
  }

  async nextStep() {
    if (this.itemInCart.length > 0) {
      const alert = await this.alertController.create({
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'OK',
            role: 'confirm',
            handler: async () => {
              await this.insertQuotation();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1000);
    }
  }

  insertQuotation() {
    let trxDto: SalesOrderRoot = {
      header: this.objectHeader,
      details: this.itemInCart
    }
    this.salesOrderService.insertObject(trxDto).subscribe(response => {
      let details: any[] = response.body["details"];
      let totalQty: number = 0;
      details.forEach(e => {
        totalQty += e.qtyRequest;
      })
      let ss: SalesOrderSummary = {
        salesOrderNum: response.body["header"]["salesOrderNum"],
        customerName: this.customerMasterList.find(r => r.id === response.body["header"]["customerId"]).description,
        totalQuantity: totalQty,
        totalAmount: response.body["header"]["grandTotal"]
      }
      this.salesOrderService.setSalesOrderSummary(ss);
      this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
      this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
    }, error => {
      console.log(error);
    });
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
