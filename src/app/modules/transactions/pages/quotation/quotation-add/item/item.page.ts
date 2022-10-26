import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController, NavController, ViewDidEnter } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { Item, ItemImage } from 'src/app/modules/transactions/models/item';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})
export class ItemPage implements OnInit, ViewDidEnter {

  private customer: Customer;

  constructor(
    private quotationService: QuotationService,
    private navController: NavController,
    private loadingController: LoadingController,
    private toastService: ToastService,
  ) { }

  ionViewDidEnter(): void {
    this.itemInCart = this.quotationService.itemInCart;
  }

  ngOnInit() {
    this.customer = this.quotationService.selectedCustomer;
    this.itemInCart = this.quotationService.itemInCart;
    if (!this.customer || this.customer === undefined) {
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'top', 'danger', 1500);
      this.navController.navigateBack('/transactions/quotation/quotation-customer');
    }
  }

  searchTextChanged() {
    this.availableItem = [];
    this.availableImages = [];
  }

  itemSearchText: string = 'a00';
  availableItem: Item[] = [];
  availableImages: ItemImage[] = [];
  async searchItem() {
    if (this.itemSearchText && this.itemSearchText.length > 2) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      await this.showLoading();
      // get images
      this.quotationService.getItemImageFile(this.itemSearchText).subscribe(response => {
        this.availableImages = response;
      }, error => {
        console.log(error);
      })
      // get item
      this.quotationService.getItemList(this.itemSearchText, this.customer.customerId, this.customer.locationId).subscribe(async response => {
        this.availableItem = response;
        this.toastService.presentToast('Search Complete', '', 'top', 'success', 1000);
        await this.hideLoading();
      }, async error => {
        console.log(error);
        await this.hideLoading();
      })
    } else {
      this.toastService.presentToast('Error', 'Please key in 3 characters and above to search', 'top', 'danger', 1000);
    }
  }

  private itemInCart: Item[] = [];
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
    await this.quotationService.setChoosenItems(this.itemInCart);
    this.navController.navigateForward('/transactions/quotation/quotation-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/transactions/quotation/quotation-customer');
  }

  /* #endregion */

}
