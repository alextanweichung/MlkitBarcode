import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from '../../models/item-list';
import { SearchItemService } from '../../services/search-item.service';

@Component({
  selector: 'app-item-add-list',
  templateUrl: './item-add-list-variation-modal.page.html',
  styleUrls: ['./item-add-list-variation-modal.page.scss'],
  providers: [DatePipe]
})
export class ItemAddListVariationModalPage implements OnInit, OnChanges {

  @Input() keyId: number;
  @Input() locationId: number;
  @Input() useTax: boolean = false;
  @Input() itemInCart: Item[] = [];
  availableItem: Item[] = [];
  itemToDisplay: ItemList[] = [];

  @Output() onItemSelected: EventEmitter<Item[]> = new EventEmitter();

  constructor(
    private searchItemService: SearchItemService,
    private toastService: ToastService,
    private loadingController: LoadingController,
    private datePipe: DatePipe
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableItem) {
      this.distinctItem();
    }
  }

  ngOnInit() {

  }

  /* #region  search item */

  searchTextChanged() {
    this.availableItem = [];
    this.itemToDisplay = [];
    // this.availableImages = [];
  }

  itemSearchText: string = 'dt0';
  // availableImages: ItemImage[] = [];
  async searchItem() {
    if (this.itemSearchText && this.itemSearchText.length > 2) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      await this.showLoading();
      this.searchItemService.getItemListWithTax(this.itemSearchText, this.datePipe.transform(new Date(), 'yyyy-MM-dd'), this.keyId, this.locationId).subscribe(async response => {
        this.availableItem = response;
        this.distinctItem();
        // this.toastService.presentToast('Search Complete', '', 'bottom', 'success', 1000);
        await this.hideLoading();
      }, async error => {
        console.log(error);
        await this.hideLoading();
      })
    } else {
      // this.toastService.presentToast('Error', 'Please key in 3 characters and above to search', 'bottom', 'danger', 1000);
    }
  }

  /* #endregion */

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
          unitPriceExTax: oneItem.unitPriceExTax,
          taxId: oneItem.taxId,
          taxPct: oneItem.taxPct,
          subTotal: null,
          subTotalExTax: null,
          variationTypeCode: oneItem.variationTypeCode
        })
      })
    }
  }

  decreaseQty(data: ItemList) {
    // only for variationTypeCode === '0'
    if (isNaN(data.qtyRequest) || data.qtyRequest === 0) {
      data.qtyRequest = 0;
    } else {
      if ((data.qtyRequest - 1) > 0) {
        data.qtyRequest = (data.qtyRequest ?? 0) - 1;
      } else {
        data.qtyRequest = 0;
      }
    }
  }

  increaseQty(data: ItemList) {
    // only for variationTypeCode === '0'
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
  }

  // pass back non-variation item back
  addItemToCart(data: ItemList) {
    // this.toastService.presentToast('Success', 'Item successfully added to cart.', 'bottom', 'success', 1000);
    let t = { ...this.availableItem.find(r => r.itemSku === data.itemSku) };
    t.qtyRequest = data.qtyRequest;
    this.onItemSelected.emit([t]); // always pass back with interface Item
    this.itemToDisplay.forEach(r => r.qtyRequest = null); // clear qty
  }

  isModalOpen: boolean = false;
  itemToViewVariation: Item[] = [];
  showModal(itemId: number) {
    this.itemToViewVariation = this.availableItem.filter(r => r.itemId === itemId);
    this.itemToViewVariation.forEach(r => r.qtyRequest = 0); // clear qty on modal pop
    this.isModalOpen = true;
  }

  hideModal() {
    this.itemToViewVariation = [];
    this.isModalOpen = false;
  }

  /* #region  variation item */

  // pass back variation item back
  increaseVariationQty(item: Item) {
    item.qtyRequest = (item.qtyRequest ?? 0) + 1;
  }

  decreaseVariationQty(item: Item) {
    // only for variationTypeCode !== '0'
    if (isNaN(item.qtyRequest) || item.qtyRequest === 0) {
      item.qtyRequest = 0;
    } else {
      if ((item.qtyRequest - 1) > 0) {
        item.qtyRequest = (item.qtyRequest ?? 0) - 1;
      } else {
        item.qtyRequest = 0;
      }
    }
  }

  async addItemVariationToCart() {
    // this.toastService.presentToast('Success', 'Item successfully added to cart.', 'bottom', 'success', 1000);
    await this.onItemSelected.emit(this.itemToViewVariation.filter(r => r.qtyRequest > 0));
    this.hideModal();
  }

  /* #endregion */

  /* #region  misc */

  selectAll(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

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
}
