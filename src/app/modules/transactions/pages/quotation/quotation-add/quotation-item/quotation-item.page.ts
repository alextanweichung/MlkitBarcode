import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController, NavController, ViewDidEnter } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { Item, ItemImage } from 'src/app/modules/transactions/models/item';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-quotation-item',
  templateUrl: './quotation-item.page.html',
  styleUrls: ['./quotation-item.page.scss'],
  providers: [DatePipe]
})
export class QuotationItemPage implements OnInit, ViewDidEnter {

  private customer: Customer;

  moduleControl: ModuleControl[] = [];
  useTax: boolean = false;
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;

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
    this.customer = this.quotationService.selectedCustomer;
    console.log("🚀 ~ file: item.page.ts ~ line 44 ~ ItemPage ~ ngOnInit ~ this.customer", this.customer)
    this.itemInCart = this.quotationService.itemInCart;
    if (!this.customer || this.customer === undefined) {
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/transactions/quotation/quotation-header');
    }
    this.loadImage = this.configService.sys_parameter.loadImage;
    // this.loadModuleControl();
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

  searchTextChanged() {
    this.availableItem = [];
    this.availableImages = [];
  }

  itemSearchText: string;
  availableItem: Item[] = [];
  availableImages: ItemImage[] = [];
  async searchItem() {
    if (this.itemSearchText && this.itemSearchText.length > 2) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      await this.showLoading();
      // get images
      if (this.loadImage) {
        this.quotationService.getItemImageFile(this.itemSearchText).subscribe(response => {
          this.availableImages = response;
        }, error => {
          console.log(error);
        })
      }
      // get item
      this.quotationService.getItemListWithTax(this.itemSearchText, this.datePipe.transform(new Date(), 'yyyy-MM-dd'), this.customer.customerId, this.customer.locationId).subscribe(async response => {
        this.availableItem = response;
        console.log("🚀 ~ file: item.page.ts ~ line 96 ~ ItemPage ~ this.quotationService.getItemListWithTax ~ this.availableItem", this.availableItem)
        this.toastService.presentToast('Search Complete', '', 'bottom', 'success', 1000);
        await this.hideLoading();
      }, async error => {
        console.log(error);
        await this.hideLoading();
      })
    } else {
      this.toastService.presentToast('Error', 'Please key in 3 characters and above to search', 'bottom', 'danger', 1000);
    }
  }

  itemInCart: Item[] = [];
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

  /* #region  steps */

  async nextStep() {
    this.itemInCart.forEach(r => {
      r.unitPriceExTax = this.commonService.computeUnitPriceExTax(r, this.useTax, this.maxPrecision);
    })
    await this.quotationService.setChoosenItems(this.itemInCart);
    this.navController.navigateForward('/transactions/quotation/quotation-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/transactions/quotation/quotation-header');
  }

  /* #endregion */

}
