import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController, NavController, ViewDidEnter } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';
import { QuotationDtoHeader } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { SearchItemService } from 'src/app/shared/services/search-item.service';

@Component({
  selector: 'app-quotation-item',
  templateUrl: './quotation-item.page.html',
  styleUrls: ['./quotation-item.page.scss'],
  providers: [DatePipe, SearchItemService, { provide: 'apiObject', useValue: 'mobileQuotation' }]
})
export class QuotationItemPage implements OnInit, ViewDidEnter {

  quotationHeader: QuotationDtoHeader;

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;
  // maxPrecision: number = 2;
  // maxPrecisionTax: number = 2;

  loadImage: boolean = true;

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private quotationService: QuotationService,
    private navController: NavController,
    private loadingController: LoadingController,
    private toastService: ToastService,
    private commonService: CommonService,
    private datePipe: DatePipe
  ) { }

  ionViewDidEnter(): void {
    this.itemInCart = this.quotationService.itemInCart;
  }

  ngOnInit() {
    this.quotationHeader = this.quotationService.quotationHeader;
    this.itemInCart = this.quotationService.itemInCart;
    if (!this.quotationHeader || this.quotationHeader === undefined) {
      this.navController.navigateBack('/transactions/quotation/quotation-header');
    }
    this.loadImage = this.configService.sys_parameter.loadImage;
    this.loadModuleControl();
    this.loadMasterList();
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

  discountGroupMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.quotationService.getMasterList().subscribe(response => {
      this.discountGroupMasterList = response.filter(x => x.objectName == 'DiscountGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  itemInCart: Item[] = [];
  async onItemSelected(event) {
    let items: Item[] = event;
    await items.forEach(r => {
      if (this.itemInCart.findIndex(rr => rr.itemSku === r.itemSku) > -1) {
        this.itemInCart.find(rr => rr.itemSku === r.itemSku).qtyRequest += r.qtyRequest;
      } else {
        this.itemInCart.push(r);
      }
    });
    this.itemInCart = [...this.itemInCart];
    await this.computeAllAmount();
  }

  onItemInCartEditCompleted(event) {
    this.itemInCart = event;
  }

  /* #region  misc */

  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'circles',
    });

    loading.present();
  }

  async hideLoading() {
    this.loadingController.dismiss();
  }

  /* #endregion */

  /* #region  add item modal */

  isModalOpen: boolean = false;
  showAddItemModal() {
    this.isModalOpen = true;
  }

  hideAddItemModal() {
    this.isModalOpen = false;
  }

  /* #endregion */

  /* #region  compute amount */

  async computeAllAmount() {
    await this.itemInCart.forEach(r => {
      // r = this.assignLineUnitPrice(r);
      if (this.quotationHeader.isItemPriceTaxInclusive) {
        this.computeUnitPriceExTax(r);
      } else {
        this.computeUnitPrice(r);
      }
    })
  }

  computeUnitPriceExTax(trxLine: Item) {
    trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.quotationHeader.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
    // this.onEditComplete();
  }

  computeUnitPrice(trxLine: Item) {
    trxLine.unitPriceExTax = trxLine.unitPrice;
    trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.quotationHeader.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
    // this.onEditComplete();
  }

  computeDiscTaxAmount(trxLine: Item) {
    trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.quotationHeader.isItemPriceTaxInclusive, this.quotationHeader.maxPrecision);
    // this.onEditComplete();
  }

  assignLineUnitPrice(item: Item) {
    if (this.useTax) {
      if (this.quotationHeader.isItemPriceTaxInclusive) {
        item.unitPrice = item.unitPrice;
        item.unitPriceExTax = this.commonService.computeAmtExclTax(item.unitPrice, item.taxPct);
      } else {
        item.unitPrice = this.commonService.computeAmtInclTax(item.unitPrice, item.taxPct);
        item.unitPriceExTax = item.unitPrice;
      }
    } else {
      item.unitPrice = item.unitPrice;
      item.unitPriceExTax = item.unitPrice;
    }
    item.unitPrice = this.commonService.roundToPrecision(item.unitPrice, this.quotationHeader.maxPrecision);
    item.unitPriceExTax = this.commonService.roundToPrecision(item.unitPriceExTax, this.quotationHeader.maxPrecision);
    return item;
  }

  /* #endregion */

  /* #region  steps */

  async nextStep() {
    await this.quotationService.setChoosenItems(this.itemInCart);
    this.navController.navigateForward('/transactions/quotation/quotation-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/transactions/quotation/quotation-header');
  }

  /* #endregion */

}
