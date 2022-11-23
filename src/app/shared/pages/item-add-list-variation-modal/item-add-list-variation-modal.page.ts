import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController } from '@ionic/angular';
import { format } from 'date-fns';
import { Item } from 'src/app/modules/transactions/models/item';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from '../../models/item-list';
import { MasterListDetails } from '../../models/master-list-details';
import { TransactionDetail } from '../../models/transaction-detail';
import { InnerVariationDetail } from '../../models/variation-detail';
import { SearchItemService } from '../../services/search-item.service';

@Component({
  selector: 'app-item-add-list',
  templateUrl: './item-add-list-variation-modal.page.html',
  styleUrls: ['./item-add-list-variation-modal.page.scss']
})
// this is for quotation and sales-order only so far
export class ItemAddListVariationModalPage implements OnInit {

  @Input() fullItemList: ItemList[] = [];
  @Input() keyId: number;
  @Input() locationId: number;
  @Input() itemVariationXMasterList: MasterListDetails[] = [];
  @Input() itemVariationYMasterList: MasterListDetails[] = [];

  availableItems: TransactionDetail[] = [];

  @Output() onItemAdded: EventEmitter<TransactionDetail> = new EventEmitter();

  constructor(
    private searchItemService: SearchItemService,
    private loadingController: LoadingController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {

  }

  /* #region  search item */

  searchTextChanged() {
    this.availableItems = [];
  }

  itemSearchText: string = 'dt0';
  async searchItem() {
    if (this.itemSearchText && this.itemSearchText.trim().length > 2) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      await this.showLoading();
      this.searchItemService.getItemInfoByKeyword(this.itemSearchText, format(new Date(), 'yyyy-MM-dd'), this.keyId, this.locationId).subscribe(async response => {
        this.availableItems = response;
        console.log("🚀 ~ file: item-add-list-variation-modal.page.ts ~ line 67 ~ ItemAddListVariationModalPage ~ searchItem ~ this.availableItems", this.availableItems)
        await this.hideLoading();
      }, async error => {
        console.log(error);
        await this.hideLoading();
      })
    } else {
      this.toastService.presentToast('Enter at least 3 characters to start searching', '', 'bottom', 'medium', 1000);
    }
  }

  /* #endregion */

  /* #region  variation type 0 */

  decreaseQty(data: TransactionDetail) {
    if (data.qtyRequest ?? 0 - 1 < 0) {
      data.qtyRequest -= 1;
    } else {
      data.qtyRequest -= 1;
    }
  }

  increaseQty(data: TransactionDetail) {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
  }
  
  async addItemToCart(data: TransactionDetail) {
    await this.onItemAdded.emit(data);
    // clear qty
    data.qtyRequest = null;
  }

  /* #endregion */

  /* #region  variation type 1 and 2 */

  isModalOpen: boolean = false;
  selectedItem: TransactionDetail;
  showModal(data: TransactionDetail) {
    this.selectedItem = data;
    this.isModalOpen = true;
  }

  hideModal() {
    this.isModalOpen = false;
    this.selectedItem = null;
  }

  decreaseVariationQty(data: InnerVariationDetail) {
    if (data.qtyRequest ?? 0 - 1 < 0) {
      data.qtyRequest -= 1;
    } else {
      data.qtyRequest -= 1;
    }
  }

  increaseVariationQty(data: InnerVariationDetail) {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
  }

  async addItemVariationToCart() {
    await this.onItemAdded.emit(this.selectedItem);
    // clear qty
    this.selectedItem.variationDetails.flatMap(r => r.details).flatMap(r => r.qtyRequest = 0);
    this.hideModal();
  }

  /* #endregion */

  /* #region  misc */

  highlight(event) {
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
