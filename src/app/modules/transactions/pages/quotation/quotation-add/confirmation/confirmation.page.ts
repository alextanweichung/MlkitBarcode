import { DatePipe } from '@angular/common';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, IonRouterOutlet, ModalController, NavController, PopoverController } from '@ionic/angular';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { Item, ItemList } from 'src/app/modules/transactions/models/item';
import { QuotationDto, QuotationLine, QuotationSummary } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.page.html',
  styleUrls: ['./confirmation.page.scss'],
  providers: [DatePipe]
})
export class ConfirmationPage implements OnInit {

  customer: Customer;
  itemInCart: Item[];

  constructor(
    private quotationService: QuotationService,
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
    this.customer = this.quotationService.selectedCustomer;
    this.itemInCart = this.quotationService.itemInCart;
    if (this.itemInCart && this.itemInCart.length > 0) {
      this.combineItemWithVariations();
    }
    this.recalculateTotals();
    console.log(this.itemInCart);
    if (!this.customer || this.customer === undefined) {
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'top', 'danger', 1500);
      this.navController.navigateBack('/quotation/quotation-customer');
    }
    if (!this.itemInCart || this.itemInCart === undefined || this.itemInCart.length === 0) {
      this.toastService.presentToast('Nothing in cart', 'Please select some Item', 'top', 'medium', 1500);
    }
    this.loadMasterList();
  }

  locationMasterList: MasterListDetails[] = [];
  salesAgentMasterList: MasterListDetails[] = [];
  termPeriodMasterList: MasterListDetails[] = [];
  countryMasterList: MasterListDetails[] = [];
  currencyMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.quotationService.getMasterList().subscribe(response => {
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.salesAgentMasterList = response.filter(x => x.objectName == 'SalesAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.termPeriodMasterList = response.filter(x => x.objectName == 'TermPeriod').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.countryMasterList = response.filter(x => x.objectName == 'Country').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.currencyMasterList = response.filter(x => x.objectName == 'Currency').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.setDefaultValue();
    }, error => {
      console.log(error);
    })
  }

  defaultLocation: number;
  defaultTermPeriod: number;
  defaultCountry: number;
  defaultCurrency: number;
  defaultExchangeRate: number;
  setDefaultValue() {
    if (this.customer.locationId) {
      this.defaultLocation = this.customer.locationId;
    } else {
      let defaultLocation = this.locationMasterList.find(item => item.isPrimary)?.id;
      if (defaultLocation) {
        this.defaultLocation = defaultLocation;
      }
    }

    if (this.customer.termPeriodId) {
      this.defaultTermPeriod = this.customer.termPeriodId;
    } else {
      let defaultTermPeriod = this.termPeriodMasterList.find(item => item.isPrimary)?.id;
      if (defaultTermPeriod) {
        this.defaultTermPeriod = defaultTermPeriod;
      }
    }

    if (this.customer.countryId) {
      this.defaultCountry = this.customer.countryId
    } else {
      let defaultCountry = this.countryMasterList.find(item => item.isPrimary)?.id;
      if (defaultCountry) {
        this.defaultCountry = defaultCountry;
      }
    }

    if (this.customer.currencyId) {
      this.defaultCurrency = this.customer.currencyId;
    } else {
      let defaultCurrency = this.currencyMasterList.find(item => item.isPrimary)?.id;
      if (defaultCurrency) {
        this.defaultCurrency = defaultCurrency;
      }
    }

    this.defaultExchangeRate = parseFloat(this.currencyMasterList.find(r => r.id == this.defaultCurrency).attribute1);
  }

  decreaseQty(item) {
    console.log("🚀 ~ file: confirmation.page.ts ~ line 118 ~ ConfirmationPage ~ decreaseQty ~ item", item)
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
    console.log("🚀 ~ file: confirmation.page.ts ~ line 137 ~ ConfirmationPage ~ resetQtyBackToOne ~ itemSku", itemSku)
    this.itemInCart
    console.log("🚀 ~ file: confirmation.page.ts ~ line 138 ~ ConfirmationPage ~ resetQtyBackToOne ~ this.itemInCart", this.itemInCart)
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
    console.log("🚀 ~ file: item.page.ts ~ line 89 ~ ItemPage ~ distinctItem ~ this.itemToDisplay", this.itemToDisplay)
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
    this.quotationService.setChoosenItems(this.itemInCart);
    this.toastService.presentToast('Delete successful', 'Item has been removed from cart.', 'top', 'success', 1500);
  }

  removeItemById(itemId: number) {
    this.itemInCart = this.itemInCart.filter(r => r.itemId !== itemId);
    this.combineItemWithVariations();
    this.quotationService.setChoosenItems(this.itemInCart);
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
              await this.insertQuotation();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1500);
    }
  }

  saveQuotation() {
    console.log(this.customer);
    console.log(this.itemInCart);
    this.navController.navigateRoot('/quotation/quotation-summary');
  }

  async insertQuotation() {    
    console.log("🚀 ~ file: confirmation.page.ts ~ line 185 ~ ConfirmationPage ~ insertQuotation ~ this.itemInCart", this.itemInCart)
    console.log("🚀 ~ file: confirmation.page.ts ~ line 184 ~ ConfirmationPage ~ insertQuotation ~ this.customer", this.customer)
    // const result = await this.presentInsertConfirmation();
    connectableObservableDescriptor.lo
    // if (result) {
    let trxLineArray: QuotationLine[] = [];
    this.quotationService.itemInCart.forEach(e => {
      let objectLine: QuotationLine = {
        quotationLineId: 0,
        quotationId: 0,
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
        locationId: this.customer.locationId,
        deactivated: true
      }
      trxLineArray = [...trxLineArray, objectLine];
    });
    let trxDto: QuotationDto = {
      header: {
        quotationId: 0,
        quotationNum: null,
        trxDate: this.datePipe.transform(new Date, 'yyyy-MM-dd'),
        businessModelType: this.customer.businessModelType,
        typeCode: (this.customer.businessModelType === 'T' || this.customer.businessModelType === 'F') ? 'S' : 'T', // Sales
        sourceType: 'M', // Mobile
        locationId: this.defaultLocation,
        customerId: this.customer.customerId,
        attention: null,
        salesAgentId: JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId,
        termPeriodId: this.defaultTermPeriod,
        countryId: this.defaultCountry,
        currencyId: this.defaultCurrency,
        currencyRate: this.defaultExchangeRate
      },
      details: trxLineArray,
    }
    this.quotationService.insertQuotation(trxDto).subscribe(response => {
      let details: any[] = response.body["details"];
      let totalQty: number = 0;
      details.forEach(e => {
        totalQty += e.qtyRequest;
      })

      let qs: QuotationSummary = {
        quotationNum: response.body["header"]["quotationNum"],
        customerName: this.customer.name,
        totalQuantity: totalQty,
        totalAmount: response.body["header"]["totalGrossAmt"]
      }
      
      this.quotationService.setQuotationSummary(qs);

      this.toastService.presentToast('Insert Complete', 'New quotation has been added', 'top', 'success', 1500);
      this.navController.navigateRoot('/quotation/quotation-summary');
    }, error => {
      console.log(error);
    });
  }

  previousStep() {
    this.navController.navigateBack('/quotation/quotation-item');
  }

}
