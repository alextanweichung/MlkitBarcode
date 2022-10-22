import { Component, NgZone, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController, NavController } from '@ionic/angular';
import { Item, ItemImage, ItemList } from 'src/app/modules/transactions/models/item';
import { SalesOrderHeader } from 'src/app/modules/transactions/models/sales-order';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})
export class ItemPage implements OnInit {

  private salesOrderHeader: SalesOrderHeader

  constructor(
    private salesOrderService: SalesOrderService,
    private navController: NavController,
    private loadingController: LoadingController,
    private ngZone: NgZone,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.salesOrderHeader = this.salesOrderService.salesOrderHeader
    if (this.salesOrderHeader === undefined || this.salesOrderHeader.customerId === undefined) {
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'top', 'danger', 1500);
      this.navController.navigateBack('/sales-order/sales-order-customer');
    }
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
      this.salesOrderService.getItemImageFile(this.itemSearchText).subscribe(response => {
        this.availableImages = response;
      }, error => {
        console.log(error);
      })
      // get item
      this.salesOrderService.getItemList(this.itemSearchText, this.salesOrderHeader.customerId, this.salesOrderHeader.locationId).subscribe(async response => {
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

  /* #endregion */

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

  nextStep() {
    this.salesOrderService.setChoosenItems(this.itemInCart);
    this.navController.navigateForward('/sales-order/sales-order-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/sales-order/sales-order-customer');
  }

  /* #endregion */

}
