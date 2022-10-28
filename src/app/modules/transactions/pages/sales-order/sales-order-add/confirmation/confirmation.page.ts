import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Item } from 'src/app/modules/transactions/models/item';
import { SalesOrderDto, SalesOrderHeader, SalesOrderLine, SalesOrderSummary } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.page.html',
  styleUrls: ['./confirmation.page.scss'],
  providers: [DatePipe]
})
export class ConfirmationPage implements OnInit {

  private salesOrderHeader: SalesOrderHeader;
  itemInCart: Item[];

  constructor(
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
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'bottom', 'danger', 1500);
      this.navController.navigateBack('/transactions/sales-order/sales-order-customer');
    }
    if (!this.itemInCart || this.itemInCart === undefined || this.itemInCart.length === 0) {
      this.toastService.presentToast('Nothing in cart', 'Please select some Item', 'bottom', 'medium', 1500);
    }
  }

  onItemInCartEditCompleted(event) {
    this.itemInCart = event;
    this.recalculateTotals();
  }

  totalQuantity: number = 0;
  totalAmount: number = 0;
  recalculateTotals() {
    if (this.itemInCart && this.itemInCart.length > 0) {
      this.totalQuantity = this.itemInCart.flatMap(r => r.qtyRequest).reduce((a, c) => Number(a) + Number(c));
      this.totalAmount = this.itemInCart.flatMap(r => r.qtyRequest * r.unitPrice).reduce((a, c) => Number(a) + Number(c));
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
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'bottom', 'danger', 1500);
    }
  }

  async insertSalesOrder() {
    // const result = await this.presentInsertConfirmation();
    connectableObservableDescriptor.lo
    // if (result) {
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
        trxDate: this.datePipe.transform(new Date, 'yyyy-MM-dd'),
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
        currencyRate: this.salesOrderHeader.exchangeRate
      },
      details: trxLineArray,
    }
    this.salesOrderService.insertSalesOrder(trxDto).subscribe(response => {
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
      
      this.salesOrderService.setSalesOrderSummary(ss);

      this.toastService.presentToast('Insert Complete', 'New sales order has been added', 'bottom', 'success', 1500);
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
