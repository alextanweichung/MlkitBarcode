import { DatePipe } from '@angular/common';
import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Item, ItemList } from 'src/app/modules/transactions/models/item';
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
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private alertController: AlertController,
    private ngZone: NgZone,
    private toastService: ToastService,
    private routerOutlet: IonRouterOutlet,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.salesOrderHeader = this.salesOrderService.salesOrderHeader;
    this.itemInCart = this.salesOrderService.itemInCart;
    if (this.itemInCart && this.itemInCart.length > 0) {
      this.combineItemWithVariations();
    }
    this.recalculateTotals();
    if (this.salesOrderHeader === undefined || this.salesOrderHeader.customerId === undefined) {
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'top', 'danger', 1500);
      this.navController.navigateBack('/sales-order/sales-order-customer');
    }
    if (!this.itemInCart || this.itemInCart === undefined || this.itemInCart.length === 0) {
      this.toastService.presentToast('Nothing in cart', 'Please select some Item', 'top', 'medium', 1500);
    }
  }

  decreaseQty(item) {
    item.qtyRequest--;
    if (item.variationTypeCode === '0') {
      this.itemInCart.find(r => r.itemId === item.itemId).qtyRequest = item.qtyRequest;
    }
    if (item.qtyRequest === 0) {
      this.presentDeleteAlert(item.itemSku);
    }
    this.recalculateTotals();
  }

  increaseQty(item) {
    item.qtyRequest++;
    if (item.variationTypeCode === '0') {
      this.itemInCart.find(r => r.itemId === item.itemId).qtyRequest = item.qtyRequest;
    }
    this.recalculateTotals();
  }
  
  resetQtyBackToOne(itemSku: string) {
    this.itemInCart
    this.ngZone.run(() => {
      this.itemInCart.find(r => r.itemSku === itemSku).qtyRequest = 1;
      this.combineItemWithVariations();
      this.recalculateTotals();
    })
  }

  totalQuantity: number = 0;
  totalAmount: number = 0;
  recalculateTotals() {
    if (this.itemInCart && this.itemInCart.length > 0) {
      this.totalQuantity = this.itemInCart.flatMap(r => r.qtyRequest).reduce((a, c) => Number(a) + Number(c));
      this.totalAmount = this.itemInCart.flatMap(r => r.qtyRequest * r.unitPrice).reduce((a, c) => Number(a) + Number(c));
    }
  }

  itemToDisplay: ItemList[] = [];
  combineItemWithVariations() {
    this.itemToDisplay = [];
    if (this.itemInCart.length > 0) {
      const itemIds = [...new Set(this.itemInCart.map(r => r.itemId))];
      itemIds.forEach(r => {
        let oneItem = this.itemInCart.find(rr => rr.itemId === r);
        this.itemToDisplay.push({
          itemId: r,
          itemCode: oneItem.itemCode,
          itemSku: oneItem.itemSku,
          description: oneItem.description,
          unitPrice: oneItem.unitPrice,
          variationTypeCode: oneItem.variationTypeCode,
          qtyRequest: oneItem.qtyRequest
        })
      })
    }
  }

  getVariationSum(item: ItemList) {
    return this.itemInCart.filter(r => r.itemId === item.itemId).flatMap(r => r.qtyRequest).reduce((a,c) => Number(a) + Number(c));
  }
  
  getVariations(item: ItemList) {
    return this.itemInCart.filter(r => r.itemId === item.itemId);
  }

  async presentDeleteAlert(itemSku: string) {
    const alert = await this.alertController.create({
      header: 'Are you sure to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.resetQtyBackToOne(itemSku);
          }
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.removeItem(itemSku);
          },
        },
      ],
    });

    await alert.present();
  }

  async presentDeleteItemAlert(itemId: number) {
    const alert = await this.alertController.create({
      header: 'Are you sure to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.removeItemById(itemId);
          },
        },
      ],
    });

    await alert.present();
  }

  removeItem(itemSku: string) {
    this.itemInCart.splice(this.itemInCart.findIndex(r => r.itemSku === itemSku), 1);
    this.combineItemWithVariations();
    this.salesOrderService.setChoosenItems(this.itemInCart);
    this.toastService.presentToast('Delete successful', 'Item has been removed from cart.', 'top', 'success', 1500);
  }

  removeItemById(itemId: number) {
    this.itemInCart = this.itemInCart.filter(r => r.itemId !== itemId);
    this.combineItemWithVariations();
    this.salesOrderService.setChoosenItems(this.itemInCart);
    this.toastService.presentToast('Delete successful', 'Item has been removed from cart.', 'top', 'success', 1500);
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
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1500);
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

      this.toastService.presentToast('Insert Complete', 'New sales order has been added', 'top', 'success', 1500);
      this.navController.navigateRoot('/sales-order/sales-order-summary');
    }, error => {
      console.log(error);
    });
  }

  previousStep() {
    this.navController.navigateBack('/sales-order/sales-order-item');
  }

}
