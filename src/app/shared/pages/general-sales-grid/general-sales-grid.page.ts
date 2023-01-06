import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { LoadingController } from '@ionic/angular';
import { format } from 'date-fns';
import { Item, ItemImage } from 'src/app/modules/transactions/models/item';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from '../../models/item-list';
import { MasterListDetails } from '../../models/master-list-details';
import { TransactionDetail } from '../../models/transaction-detail';
import { InnerVariationDetail, VariationDetail } from '../../models/variation-detail';
import { SearchItemService } from '../../services/search-item.service';

@Component({
  selector: 'app-general-sales-grid',
  templateUrl: './general-sales-grid.page.html',
  styleUrls: ['./general-sales-grid.page.scss'],
})
export class GeneralSalesGridPage implements OnInit {

  @Input() fullItemList: ItemList[] = [];
  @Input() keyId: number;
  @Input() locationId: number;
  @Input() itemVariationXMasterList: MasterListDetails[] = [];
  @Input() itemVariationYMasterList: MasterListDetails[] = [];

  availableItems: TransactionDetail[] = [];
  availableImages: ItemImage[] = [];

  @Output() onItemAdded: EventEmitter<TransactionDetail> = new EventEmitter();

  onlineMode: boolean;

  constructor(
    private configService: ConfigService,
    private searchItemService: SearchItemService,
    private loadingController: LoadingController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.onlineMode = this.configService.sys_parameter.onlineMode;
    if (Capacitor.getPlatform() !== 'web') {
      this.configService.loadItemMaster();
      this.configService.loadItemBarcode();
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

  /* #region  search item */

  searchTextChanged() {
    this.availableItems = [];
    this.availableImages = [];
  }

  itemSearchText: string = 'dt0';
  async searchItem() {
    if (this.itemSearchText && this.itemSearchText.trim().length > 2) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      await this.showLoading();
      if (this.onlineMode) {
        this.searchItemService.getItemInfoByKeyword(this.itemSearchText, format(new Date(), 'yyyy-MM-dd'), this.keyId, this.locationId).subscribe(async response => {
          this.availableItems = response;
          await this.hideLoading();
        }, async error => {
          console.log(error);
          await this.hideLoading();
        })
        this.searchItemService.getItemImageFile(this.itemSearchText).subscribe(response => {
          this.availableImages = response;
        }, error => {
          console.log(error);
        })
      } else {
        this.availableItems = [];
        if (this.configService.item_Masters.length === 0 || this.configService.item_Barcodes.length === 0) {
          await this.hideLoading();
          this.toastService.presentToast('Something went wrong!', 'Local Item List not found', 'top', 'danger', 1000);
        } else {
          let found = this.configService.item_Masters.filter(r => r.code.toLowerCase().includes(this.itemSearchText.toLowerCase()));
          if (found) {
            found.forEach(async r => {
              if (r.varCd === '0') {
                this.availableItems.push({
                  itemId: r.id,
                  itemCode: r.code,
                  description: r.itemDesc,
                  variationTypeCode: r.varCd,
                  unitPrice: r.price,
                  discountGroupCode: r.discCd,
                  discountExpression: r.discPct + '%',
                  taxId: r.taxId,
                  taxCode: r.taxCd,
                  taxPct: r.taxPct,
                  qtyRequest: null,
                  itemPricing: {
                    itemId: r.id,
                    unitPrice: r.price,
                    discountGroupCode: r.discCd,
                    discountExpression: r.discPct + '%',
                    discountPercent: r.discPct
                  }
                })
              } else {
                let variations = this.configService.item_Barcodes.filter(v => v.itemId === r.id);
                await variations.sort((a, b) => {
                  if (a.xSeq === b.xSeq) {
                    if (a.ySeq && b.ySeq) {
                      return a.ySeq - b.ySeq
                    }
                  } else {
                    return a.xSeq - b.ySeq
                  }
                })
                const distinctXId = [...new Set(variations.map(x => x.xId))];
                let vd: VariationDetail[] = [];
                distinctXId.forEach(x => {
                  let ivd: InnerVariationDetail[] = [];
                  let belong = variations.filter(xx => xx.xId === x);
                  belong.forEach(y => {
                    ivd.push({
                      sequence: y.ySeq,
                      itemBarcode: y.barcode,
                      itemBarcodeTagId: y.id,
                      itemSku: y.sku,
                      itemVariationYId: y.yId,
                      qtyRequest: null
                    })
                  })
                  vd.push({
                    itemVariationXId: x,
                    details: ivd
                  })
                })
                this.availableItems.push({
                  itemId: r.id,
                  itemCode: r.code,
                  description: r.itemDesc,
                  variationTypeCode: r.varCd,
                  unitPrice: r.price,
                  discountGroupCode: r.discCd,
                  discountExpression: r.discPct + '%',
                  taxId: r.taxId,
                  taxCode: r.taxCd,
                  taxPct: r.taxPct,
                  qtyRequest: null,
                  itemPricing: {
                    itemId: r.id,
                    unitPrice: r.price,
                    discountGroupCode: r.discCd,
                    discountExpression: r.discPct + '%',
                    discountPercent: r.discPct
                  },
                  variationDetails: vd
                })
              }
            })
            await this.hideLoading();
          } else {
            this.toastService.presentToast('Item not found', '', ' bottom', 'medium', 1000);
          }
        }
      }
    } else {
      this.toastService.presentToast('Enter at least 3 characters to start searching', '', 'top', 'medium', 1000);
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
    this.toastService.presentToast('Item added to cart', '', 'top', 'success', 1000);
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
    this.toastService.presentToast('Item added to cart', '', 'top', 'success', 1000);
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
