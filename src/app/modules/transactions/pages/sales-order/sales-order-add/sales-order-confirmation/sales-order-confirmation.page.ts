import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';
import { SalesOrderDto, SalesOrderHeader, SalesOrderLine, SalesOrderSummary } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-sales-order-confirmation',
  templateUrl: './sales-order-confirmation.page.html',
  styleUrls: ['./sales-order-confirmation.page.scss'],
  providers: [DatePipe]
})
export class SalesOrderConfirmationPage implements OnInit {

  salesOrderHeader: SalesOrderHeader;
  itemInCart: Item[];
  
  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;

  constructor(
    private authService: AuthService,
    private salesOrderService: SalesOrderService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.salesOrderHeader = this.salesOrderService.salesOrderHeader;
    this.itemInCart = this.salesOrderService.itemInCart;
    this.recalculateTotals();
    if (this.salesOrderHeader === undefined || this.salesOrderHeader.customerId === undefined) {
      this.navController.navigateBack('/transactions/sales-order/sales-order-header');
    }
    if (!this.itemInCart || this.itemInCart === undefined || this.itemInCart.length === 0) {
      this.toastService.presentToast('Nothing in cart', 'Please select some Item', 'bottom', 'medium', 1000);
    }
    this.loadModuleControl();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let SystemWideActivateTaxControl = this.moduleControl.find(x => x.ctrlName === "SystemWideActivateTax");
      if (SystemWideActivateTaxControl != undefined) {
        this.useTax = SystemWideActivateTaxControl.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
    }, error => {
      console.log(error);
    })
  }

  onItemInCartEditCompleted(event) {
    this.itemInCart = event;
    this.recalculateTotals();
  }

  totalQuantity: number = 0;
  subtotalBeforeTax: number = 0;
  taxAmount: number = 0;
  netTotal: number = 0;
  recalculateTotals() {
    if (this.itemInCart && this.itemInCart.length > 0) {
      this.totalQuantity = this.itemInCart.flatMap(r => r.qtyRequest).reduce((a, c) => Number(a) + Number(c));
      this.subtotalBeforeTax = this.itemInCart.flatMap(r => (r.qtyRequest * r.unitPriceExTax) - r.discountAmtExTax).reduce((a, c) => Number(a) + Number(c));
      this.taxAmount = this.itemInCart.flatMap(r => r.taxAmt).reduce((a,c) => Number(a) + Number(c));
      this.netTotal = this.itemInCart.flatMap(r => (r.qtyRequest * r.unitPrice) - r.discountAmt).reduce((a, c) => Number(a) + Number(c));
    } else {
      this.totalQuantity = null;
      this.subtotalBeforeTax = null;
      this.taxAmount = null;
      this.netTotal = null;
    }
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
              await this.insertSalesOrder();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'bottom', 'danger', 1000);
    }
  }

  async insertSalesOrder() {
    let trxLineArray: SalesOrderLine[] = [];
    this.salesOrderService.itemInCart.forEach(e => {
      let objectLine: SalesOrderLine = {
        salesOrderLineId: 0,
        salesOrderId: 0,
        itemId: e.itemId,
        itemVariationXId: e.itemVariationLineXId,
        itemVariationYId: e.itemVariationLineYId,
        itemSku: e.itemSku,
        itemCode: e.itemCode,
        itemUomId: e.itemUomId,
        description: e.description,
        extendedDescription: e.description,
        qtyRequest: e.qtyRequest,
        unitPrice: e.unitPrice,
        unitPriceExTax: e.unitPriceExTax,
        discountGroupCode: e.discountGroupCode,
        discountExpression: e.discountExpression,
        discountAmt: e.discountAmt,
        discountAmtExTax: e.discountAmtExTax,
        taxId: e.taxId,
        taxPct: e.taxPct,
        taxAmt: e.taxAmt,
        taxInclusive: this.salesOrderHeader.isItemPriceTaxInclusive,
        subTotal: e.subTotal,
        subTotalExTax: e.subTotalExTax,
        sequence: 0,
        locationId: this.salesOrderHeader.locationId,
        deactivated: true
      }
      trxLineArray = [...trxLineArray, objectLine];
    });
    let trxDto: SalesOrderDto = {
      header: {
        salesOrderId: 0,
        salesOrderNum: null,
        trxDate: new Date(),
        businessModelType: this.salesOrderHeader.businessModelType,
        typeCode: this.salesOrderHeader.typeCode,
        sourceType: 'M', // Mobile
        locationId: this.salesOrderHeader.locationId,
        customerId: this.salesOrderHeader.customerId,
        attention: null,
        salesAgentId: this.salesOrderHeader.salesAgentId,
        termPeriodId: this.salesOrderHeader.termPeriodId,
        countryId: this.salesOrderHeader.countryId,
        currencyId: this.salesOrderHeader.currencyId,
        currencyRate: this.salesOrderHeader.currencyRate,
        isHomeCurrency: this.salesOrderHeader.isHomeCurrency
      },
      details: trxLineArray,
    }
    console.log("🚀 ~ file: sales-order-confirmation.page.ts ~ line 150 ~ SalesOrderConfirmationPage ~ this.salesOrderService.insertSalesOrder ~ trxDto", trxDto)
    this.salesOrderService.insertSalesOrder(trxDto).subscribe(async response => {
      let details: any[] = response.body["details"];
      let totalQty: number = 0;
      details.forEach(e => {
        totalQty += e.qtyRequest;
      })

      let ss: SalesOrderSummary = {
        salesOrderNum: response.body["header"]["salesOrderNum"],
        customerId: this.salesOrderHeader.customerId,
        totalQuantity: totalQty,
        totalAmount: response.body["header"]["totalGrossAmt"]
      }      
      await this.salesOrderService.setSalesOrderSummary(ss);
      this.toastService.presentToast('Insert Complete', 'New sales order has been added', 'bottom', 'success', 1000);
      this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
    }, error => {
      console.log(error);
    });
  }

  previousStep() {
    this.salesOrderService.setChoosenItems(this.itemInCart);
    this.navController.navigateBack('/transactions/sales-order/sales-order-item');
  }

}
