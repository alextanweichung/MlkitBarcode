import { Component, NgZone, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { Customer } from 'src/app/modules/transactions/models/customer';
import { Item, ItemImage, ItemList } from 'src/app/modules/transactions/models/item';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.page.html',
  styleUrls: ['./item.page.scss'],
})
export class ItemPage implements OnInit {

  private customer: Customer;

  constructor(
    private quotationService: QuotationService,
    private navController: NavController,
    private loadingController: LoadingController,
    private ngZone: NgZone,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.customer = this.quotationService.selectedCustomer;
    if (!this.customer || this.customer === undefined) {
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'top', 'danger', 1500);
      this.navController.navigateBack('/quotation/quotation-customer');
    }
  }

  searchTextChanged() {
    this.availableItem = [];
    this.itemToDisplay = [];
    this.availableImages = [];
  }

  itemSearchText: string = "a00";
  availableItem: Item[] = [];
  availableImages: ItemImage[] = [];
  async searchItem() {
    if (this.itemSearchText && this.itemSearchText.length > 2) {

      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      await this.showLoading();

      this.quotationService.getItemImageFile(this.itemSearchText).subscribe(response => {
        this.availableImages = response;
      }, error => {
        console.log(error);
      })

      this.quotationService.getItemList(this.itemSearchText, this.customer.customerId, this.customer.locationId).subscribe(async response => {
        this.availableItem = response;
        this.distinctItem();
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

  itemToDisplay: ItemList[] = [];
  distinctItem() {
    this.itemToDisplay = [];
    if (this.availableItem.length > 0) {
      const itemIds = [...new Set(this.availableItem.map(r => r.itemId))];
      itemIds.forEach(r => {
        let oneItem = this.availableItem.find(rr => rr.itemId === r);
        this.itemToDisplay.push({
          itemId: r,
          itemCode: oneItem.itemCode,
          itemSku: oneItem.itemSku,
          description: oneItem.description,
          unitPrice: oneItem.unitPrice,
          variationTypeCode: oneItem.variationTypeCode
        })
      })
    }

    console.log("🚀 ~ file: item.page.ts ~ line 89 ~ ItemPage ~ distinctItem ~ this.itemToDisplay", this.itemToDisplay)
  }

  matchImage(itemId: number) {
    let defaultImageUrl = "assets/icon/favicon.png";
    let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
    if (lookup) {
      return "data:image/png;base64, " + lookup;
    }
    return defaultImageUrl;
  }

  /* #region  qty handle here */

  decreaseQty(data: ItemList) {
    // only for variationTypeCode === '0'
    this.ngZone.run(() => {
      if (isNaN(data.qtyRequest) || data.qtyRequest === 0) {
        data.qtyRequest = 0;
      } else {
        if ((data.qtyRequest - 1) > 0) {
          data.qtyRequest = (data.qtyRequest ?? 0) - 1;
        } else {
          data.qtyRequest = 0;
        }
      }
    })
  }

  increaseQty(data: ItemList) {
    // only for variationTypeCode === '0'
    this.ngZone.run(() => {
      data.qtyRequest = (data.qtyRequest ?? 0) + 1;
    })
  }

  itemInCart: Item[] = [];
  addItemToCart(data: ItemList) {
    // only for variationTypeCode === '0'
    if (this.itemInCart.findIndex(r => r.itemId === data.itemId && r.variationTypeCode === '0') > -1) {
      this.itemInCart.find(r => r.itemId === data.itemId && r.variationTypeCode === '0').qtyRequest += data.qtyRequest;
    } else {
      let d = this.availableItem.find(r => r.itemId === data.itemId && r.variationTypeCode === '0');
      d.qtyRequest = data.qtyRequest;
      this.itemInCart.push(JSON.parse(JSON.stringify(d)));
    }
    this.ngZone.run(() => {
      this.toastService.presentToast('Success', 'Item successfully added to cart.', 'top', 'success', 1500);
      data.qtyRequest = null;
    })
  }

  isModalOpen: boolean = false;
  itemToViewVariation: Item[] = [];
  handleVariationsQty(itemId: number) {
    this.itemToViewVariation = this.availableItem.filter(r => r.itemId === itemId);
    this.isModalOpen = true;
  }

  hideModal() {
    this.itemToViewVariation = [];
    this.isModalOpen = false;
  }

  increaseVariationQty(item: Item) {
    // only for variationTypeCode === '0'
    this.ngZone.run(() => {
      item.qtyRequest = (item.qtyRequest ?? 0) + 1;
    })
  }

  decreaseVariationQty(item: Item) {
    // only for variationTypeCode === '0'
    this.ngZone.run(() => {
      if (isNaN(item.qtyRequest) || item.qtyRequest === 0) {
        item.qtyRequest = 0;
      } else {
        if ((item.qtyRequest - 1) > 0) {
          item.qtyRequest = (item.qtyRequest ?? 0) - 1;
        } else {
          item.qtyRequest = 0;
        }
      }
    })    
  }

  addItemVariationToCart() {
    if (this.isModalOpen && this.itemToViewVariation.length > 0) {
      this.itemToViewVariation.forEach(r => {
        if (r.qtyRequest && r.qtyRequest > 0) {
          if (this.itemInCart.findIndex(rr => rr.itemId === r.itemId && rr.itemSku === r.itemSku) > -1) {
            this.itemInCart.find(rr => rr.itemId === r.itemId && rr.itemSku === r.itemSku).qtyRequest += r.qtyRequest;
          } else {
            this.itemInCart.push(JSON.parse(JSON.stringify(r)));
          }
        }
      })
    }
    this.hideModal();
    this.availableItem.forEach(r => r.qtyRequest = null);
    this.toastService.presentToast('Success', 'Item successfully added to cart.', 'top', 'success', 1500);
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
    this.quotationService.setChoosenItems(this.itemInCart);
    this.itemInCart = [];
    this.navController.navigateForward('/quotation/quotation-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/quotation/quotation-customer');
  }

  /* #endregion */

}
