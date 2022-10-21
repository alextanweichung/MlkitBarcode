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
    console.log("🚀 ~ file: item.page.ts ~ line 26 ~ ItemPage ~ ngOnInit ~ this.salesOrderHeader", this.salesOrderHeader)
    if (this.salesOrderHeader === undefined || this.salesOrderHeader.customerId === undefined) {
      this.toastService.presentToast('Something went wrong', 'Please select a Customer', 'top', 'danger', 1500);
      this.navController.navigateBack('/sales-order/sales-order-customer');
    }
  }

  searchTextChanged() {
    this.availableItem = [];
    this.itemToDisplay = [];
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

      this.salesOrderService.getItemImageFile(this.itemSearchText).subscribe(response => {
        this.availableImages = response;
      }, error => {
        console.log(error);
      })

      this.salesOrderService.getItemList(this.itemSearchText, this.salesOrderHeader.customerId, this.salesOrderHeader.locationId).subscribe(async response => {
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
    this.salesOrderService.setChoosenItems(this.itemInCart);
    this.itemInCart = [];
    this.navController.navigateForward('/sales-order/sales-order-confirmation');
  }

  previousStep() {
    this.navController.navigateBack('/sales-order/sales-order-customer');
  }

  /* #endregion */

}
