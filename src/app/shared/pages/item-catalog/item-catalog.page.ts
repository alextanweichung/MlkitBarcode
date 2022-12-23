import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { format } from 'date-fns';
import { ItemImage } from 'src/app/modules/transactions/models/item';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterList } from '../../models/master-list';
import { MasterListDetails } from '../../models/master-list-details';
import { TransactionDetail } from '../../models/transaction-detail';
import { InnerVariationDetail } from '../../models/variation-detail';
import { CommonService } from '../../services/common.service';
import { SearchItemService } from '../../services/search-item.service';

@Component({
  selector: 'app-item-catalog',
  templateUrl: './item-catalog.page.html',
  styleUrls: ['./item-catalog.page.scss'],
})
export class ItemCatalogPage implements OnInit, OnChanges {

  @Input() keyId: number;
  @Input() locationId: number;
  @Input() fullMasterList: MasterList[] = [];
  @Input() useTax: boolean;
  @Input() isItemPriceTaxInclusive: boolean;
  @Input() maxPrecision: number;
  @Input() showImage: boolean = false;

  brandMasterList: MasterListDetails[] = [];
  groupMasterList: MasterListDetails[] = [];
  categoryMasterList: MasterListDetails[] = [];

  @Output() onItemAdded: EventEmitter<TransactionDetail> = new EventEmitter();

  constructor(
    private searchItemService: SearchItemService,
    private commonService: CommonService,
    private configService: ConfigService,
    private toastService: ToastService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.showImage) {
      if (this.showImage) {
        this.loadImages();
      }
    }
  }

  ngOnInit() {
    this.brandMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemBrand').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.groupMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemGroup').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.categoryMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemCategory').flatMap(src => src.details).filter(y => y.deactivated == 0);
  }

  /* #region  search item */

  itemSearchText: string;
  availableItems: TransactionDetail[] = [];
  availableImages: ItemImage[] = [];
  searchTextChanged() {
    this.availableItems = [];
    this.availableImages = [];
  }

  searchItem() {
    if (this.itemSearchText && this.itemSearchText.trim().length > 2) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      // if (this.configService.sys_parameter && this.configService.sys_parameter.onlineMode) {
        // online mode
        this.searchItemService.getItemInfoByKeyword(this.itemSearchText, format(new Date(), 'yyyy-MM-dd'), this.keyId, this.locationId).subscribe(response => {
          this.availableItems = response;
          this.availableItems.forEach(r =>
            this.assignLineUnitPrice(r)
          )
          this.toastService.presentToast('Search Completed', '', 'top', 'success', 1000);
        })
        if (this.showImage) {
          this.loadImages();
        }
      // } else {
      //   // offline mode, search item from local item master and item barcode
      // }
    } else {
      this.toastService.presentToast('Enter at least 3 characters to start searching', '', 'top', 'warning', 1000);
    }
    this.onBrowseModeChanged();
  }

  loadImages() {
    this.searchItemService.getItemImageFile(this.itemSearchText).subscribe(response => {
      this.availableImages = response;
    }, error => {
      console.log(error);
    })
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.searchItem();
      event.preventDefault();
    }
  }

  browseMode: string = 'brand';
  onBrowseModeChanged() {
    this.browseBy = [];
  }

  browseBy: string[];

  /* #endregion */

  /* #region  item grid */

  matchImage(itemId: number) {
    let defaultImageUrl = "assets/icon/favicon.png";
    let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
    if (lookup) {
      return "data:image/png;base64, " + lookup;
    }
    return defaultImageUrl;
  }

  /* #endregion */

  /* #region  unit price, tax, discount */

  assignLineUnitPrice(item: TransactionDetail) {
    if (this.useTax) {
      if (this.isItemPriceTaxInclusive) {
        item.unitPrice = item.itemPricing.unitPrice;
        item.unitPriceExTax = this.commonService.computeAmtExclTax(item.itemPricing.unitPrice, item.taxPct);
      } else {
        item.unitPrice = this.commonService.computeAmtInclTax(item.itemPricing.unitPrice, item.taxPct);
        item.unitPriceExTax = item.itemPricing.unitPrice;
      }
    } else {
      item.unitPrice = item.itemPricing.unitPrice;
      item.unitPriceExTax = item.itemPricing.unitPrice;
    }
    item.unitPrice = this.commonService.roundToPrecision(item.unitPrice, this.maxPrecision);
    item.unitPriceExTax = this.commonService.roundToPrecision(item.unitPriceExTax, this.maxPrecision);
  }

  /* #endregion */

  /* #region  none variation */

  decreaseQty(data: TransactionDetail) {
    if ((data.qtyRequest - 1) < 0) {
      data.qtyRequest = 0;
    } else {
      data.qtyRequest -= 1;
    }
  }

  increaseQty(data: TransactionDetail) {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
  }

  addToCart(data: TransactionDetail) {
    this.onItemAdded.emit(JSON.parse(JSON.stringify(data)));
    data.qtyRequest = 0;
  }

  /* #endregion */

  /* #region  variation */

  isModalOpen: boolean = false;
  selectedItem: TransactionDetail;
  hideModal() {
    this.isModalOpen = false;
    this.selectedItem = null;
  }

  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  showModal(data: TransactionDetail) {
    this.selectedItem = JSON.parse(JSON.stringify(data));
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.isModalOpen = true;
  }

  decreaseVariationQty(data: InnerVariationDetail) {
    if ((data.qtyRequest - 1) < 0) {
      data.qtyRequest = 0;
    } else {
      data.qtyRequest -= 1;
    }
  }

  increaseVariationQty(data: InnerVariationDetail) {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
  }  

  addVariationToCart() {
    var totalQty = 0;
    if (this.selectedItem.variationDetails) {
      this.selectedItem.variationDetails.forEach(x => {
        x.details.forEach(y => {
          totalQty = totalQty + y.qtyRequest;
        });
      })
    }
    this.selectedItem.qtyRequest = totalQty;
    this.onItemAdded.emit(JSON.parse(JSON.stringify(this.selectedItem)));
    this.hideModal();
  }

  /* #endregion */

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  /* #endregion */

}
