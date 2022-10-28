import { Component, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController, NavController, ViewDidEnter } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { Item, ItemImage } from 'src/app/modules/transactions/models/item';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})
export class ItemPage implements OnInit, ViewDidEnter {

  private customer: Customer;

  moduleControl: ModuleControl[] = [];

  loadImage: boolean = true;

  constructor(
    private authService: AuthService,
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
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'bottom', 'danger', 1500);
      this.navController.navigateBack('/transactions/quotation/quotation-customer');
    }
    this.loadModuleControl();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;      
      let loadImage = this.moduleControl.find(r => r.ctrlName === "LoadImage")?.ctrlValue;
      if (loadImage) {
        this.loadImage = loadImage === '1' ? true : false;
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
      this.quotationService.getItemList(this.itemSearchText, this.customer.customerId, this.customer.locationId).subscribe(async response => {
        this.availableItem = response;
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
    await this.quotationService.setChoosenItems(this.itemInCart);
    this.navController.navigateForward('/transactions/quotation/quotation-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/transactions/quotation/quotation-customer');
  }

  /* #endregion */

}
