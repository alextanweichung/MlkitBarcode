import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { format } from 'date-fns';
import { ItemImage } from 'src/app/modules/transactions/models/item';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterList } from '../../models/master-list';
import { MasterListDetails } from '../../models/master-list-details';
import { ModuleControl } from '../../models/module-control';
import { PrecisionList } from '../../models/precision-list';
import { TransactionDetail } from '../../models/transaction-detail';
import { InnerVariationDetail } from '../../models/variation-detail';
import { CommonService } from '../../services/common.service';
import { SearchItemService } from '../../services/search-item.service';
import { InfiniteScrollCustomEvent, IonSearchbar, ViewWillEnter } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-item-catalog',
  templateUrl: './item-catalog.page.html',
  styleUrls: ['./item-catalog.page.scss'],
})
export class ItemCatalogPage implements OnInit, OnChanges {

  @Input() itemInCart: TransactionDetail[] = [];
  @Input() keyId: number;
  @Input() locationId: number;
  @Input() fullMasterList: MasterList[] = [];
  @Input() useTax: boolean;
  @Input() objectHeader: any;
  @Input() precisionSales: PrecisionList;
  @Input() precisionSalesUnitPrice: PrecisionList;
  @Input() isItemPriceTaxInclusive: boolean;
  @Input() showImage: boolean = false;
  @Input() showAvailQty: boolean = false;
  @Input() isSalesOrder: boolean = false;
  @Input() isBackToBackOrder: boolean = false;
  @Input() disableIfPricingNotSet: boolean = true;

  brandMasterList: MasterListDetails[] = [];
  groupMasterList: MasterListDetails[] = [];
  categoryMasterList: MasterListDetails[] = [];
  salesOrderQuantityControl: string = "0";
  systemWideBlockConvertedCode: boolean = false;
  itemListLoadSize: number = 10;
  
  @ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;
  @Output() onItemAdded: EventEmitter<TransactionDetail> = new EventEmitter();

  constructor(
    private authService: AuthService,
    private searchItemService: SearchItemService,
    private commonService: CommonService,
    private configService: ConfigService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemInCart) {
      this.computeQtyInCart();
    }
  }

  ngOnInit() {
    this.brandMasterList = this.fullMasterList.filter(x => x.objectName == "ItemBrand").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.groupMasterList = this.fullMasterList.filter(x => x.objectName == "ItemGroup").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.categoryMasterList = this.fullMasterList.filter(x => x.objectName == "ItemCategory").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.loadModuleControl();
  }

  moduleControl: ModuleControl[] = [];
  configOrderingActivateMOQControl: boolean;
  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;

      if (this.isSalesOrder) {
        let salesOrderQuantityControl = this.moduleControl.find(x => x.ctrlName === "SalesOrderQuantityControl");
        if (salesOrderQuantityControl) {
          this.salesOrderQuantityControl = salesOrderQuantityControl.ctrlValue;
        }
      }

      let itemListLoadSize = this.moduleControl.find(x => x.ctrlName === "ItemListLoadSize")?.ctrlValue;
      if (itemListLoadSize && Number(itemListLoadSize) > 0) {
        this.itemListLoadSize = Number(itemListLoadSize);
      } else {
        this.itemListLoadSize = 10;
      }

      let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
      if (blockConvertedCode) {
        this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
      } else {
        this.systemWideBlockConvertedCode = false;
      }

      let moqCtrl = this.moduleControl.find(x => x.ctrlName === "OrderingActivateMOQControl");
      if (moqCtrl && moqCtrl.ctrlValue.toUpperCase() == 'Y') {
        if (this.isSalesOrder || this.isBackToBackOrder) {
          this.configOrderingActivateMOQControl = true;
        } else {
          this.configOrderingActivateMOQControl = false;
        }
      } else {
        this.configOrderingActivateMOQControl = false;
      }

    })
  }

  /* #region  search item */

  itemSearchText: string;
  availableItems: TransactionDetail[] = [];
  availableImages: ItemImage[] = [];
  searchTextChanged() {
    this.availableItems = [];
    this.availableImages = [];
  }

  startIndex: number = 0;
  async searchItem(searchText: string, newSearch: boolean) {
    if (newSearch) {
      this.availableItems = [];
    }
    this.itemSearchText = searchText;
    try {
      await this.loadingService.showLoading();
      if (this.itemSearchText && this.itemSearchText.trim().length > 2) {
        if (Capacitor.getPlatform() !== "web") {
          Keyboard.hide();
        }
        this.searchItemService.getItemInfoByKeywordfortest(this.itemSearchText, format(new Date(), "yyyy-MM-dd"), this.keyId, this.objectHeader.locationId ?? 0, this.startIndex, this.itemListLoadSize).subscribe(async response => {
          let rrr = response;
          if (rrr && rrr.length > 0) {
            rrr.forEach(r => {
              if (r.itemPricing !== null) {
                this.assignTrxItemToDataLine(r)
              }
            })
          } else {
            this.startIndex = this.availableItems.length;
          }
          this.availableItems = [...this.availableItems, ...rrr];
          this.computeQtyInCart();
          await this.loadingService.dismissLoading()
          this.toastService.presentToast("Search Complete", `${this.availableItems.length} item(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
        })
        if (Capacitor.getPlatform() !== "web") {
          this.loadImages(this.itemSearchText); // todo : to handle load image based on availableItems
        }
      } else {
        await this.loadingService.dismissLoading()
        this.toastService.presentToast("", "Enter at least 3 characters to search", "top", "warning", 1000);
      }
      this.onBrowseModeChanged();
    } catch (e) {
      await this.loadingService.dismissLoading()
      console.error(e);
    } finally {
      await this.loadingService.dismissLoading()
    }
  }

  onIonInfinite(event) {
    this.startIndex += this.itemListLoadSize;
    this.searchItem(this.itemSearchText, false);
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  loadImages(searchText) {
    this.searchItemService.getItemImageFile(searchText).subscribe(response => {
      this.availableImages = response;
    }, error => {
      console.log(error);
    })
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.searchItem(this.itemSearchText, true);
      event.preventDefault();
    }
  }

  browseMode: string = "brand";
  onBrowseModeChanged() {
    this.browseBy = [];
  }

  computeQtyInCart() {
    if (this.availableItems && this.availableItems.length > 0) {
      this.availableItems.forEach(r => {
        if (this.itemInCart.findIndex(rr => rr.itemId === r.itemId) > -1) {
          r.qtyInCart = this.itemInCart.filter(rr => rr.itemId === r.itemId).flatMap(r => r.qtyRequest).reduce((a, c) => a + c, 0);
          if (r.variationTypeCode === "1" || r.variationTypeCode === "2") {
            r.variationDetails.flatMap(x => x.details).forEach(y => {
              y.qtyInCart = this.itemInCart.filter(rr => rr.itemId === r.itemId).flatMap(rr => rr.variationDetails).flatMap(xx => xx.details).filter(yy => yy.qtyRequest && yy.qtyRequest > 0 && yy.itemSku === y.itemSku).flatMap(yy => yy.qtyRequest).reduce((a, c) => a + c, 0);
            })
          }
        } else {
          r.qtyInCart = null;
          if (r.variationTypeCode === "1" || r.variationTypeCode === "2") {
            r.variationDetails.forEach(x => {
              x.details.forEach(y => {
                y.qtyInCart = null;
              })
            })
          }
        }
      })
    }
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

  assignTrxItemToDataLine(item: TransactionDetail) {
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
    item.unitPrice = this.commonService.roundToPrecision(item.unitPrice, this.objectHeader?.isHomeCurrency?this.precisionSalesUnitPrice.localMax:this.precisionSalesUnitPrice.foreignMax);
    item.unitPriceExTax = this.commonService.roundToPrecision(item.unitPriceExTax, this.objectHeader?.isHomeCurrency?this.precisionSalesUnitPrice.localMax:this.precisionSalesUnitPrice.foreignMax);
    item.oriUnitPrice = item.unitPrice;
    item.oriUnitPriceExTax = item.unitPriceExTax;

    if (this.configOrderingActivateMOQControl) {
      if (item.minOrderQty) {
        item.minOrderQty = item.minOrderQty;
      } else {
        item.minOrderQty = 0;
      }
    }
  }

  calculatNetPrice(price, discountExpression) {
    if (discountExpression != "" && discountExpression != null) {
      let splittedDisc = discountExpression.split(/[+/]/g);
      splittedDisc.forEach(x => {
        if (x.includes("%")) {
          let currentdiscPct = parseFloat(x) / 100;
          let currentDiscAmt = price * currentdiscPct;
          price = price - currentDiscAmt;
        } else {
          price = price - parseFloat(x);
        }
      })
    }
    return price;
  }

  /* #endregion */

  /* #region  none variation */

  decreaseQty(data: TransactionDetail) {
    if ((data.qtyRequest - 1) < 0) {
      data.qtyRequest = null;
    } else {
      data.qtyRequest -= 1;
    }
  }

  isValidQty(data: TransactionDetail) {
    if (this.isSalesOrder && this.salesOrderQuantityControl == "1") {
      if (((data.qtyRequest ?? 0) + 1) > data.actualQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
      }
    } else if (this.isSalesOrder && this.salesOrderQuantityControl == "2") {
      if (((data.qtyRequest ?? 0) + 1) > data.availableQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
      }
    }
  }

  increaseQty(data: TransactionDetail) {
    if (this.isSalesOrder && this.salesOrderQuantityControl == "1") {
      if (((data.qtyRequest ?? 0) + 1) > data.actualQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
      } else {
        data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      }
    } else if (this.isSalesOrder && this.salesOrderQuantityControl == "2") {
      if (((data.qtyRequest ?? 0) + 1) > data.availableQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
      } else {
        data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      }
    } else {
      data.qtyRequest = (data.qtyRequest ?? 0) + 1;
    }
  }

  async addToCart(data: TransactionDetail) {
    let isBlock = this.validateNewItemConversion(data);
    if (!isBlock) {
      await this.validateMinOrderQty(data);
      this.availableItems.find(r => r.itemId === data.itemId).qtyInCart = this.availableItems.filter(r => r.itemId === data.itemId).flatMap(r => r.qtyInCart ?? 0).reduce((a, c) => a + c, 0) + data.qtyRequest;
      setTimeout(() => {
        this.onItemAdded.emit(JSON.parse(JSON.stringify(data)));
        data.qtyRequest = null;
      }, 10);
    }
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
    this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
    this.isModalOpen = true;
  }

  decreaseVariationQty(data: InnerVariationDetail) {
    if ((data.qtyRequest - 1) < 0) {
      data.qtyRequest = null;
    } else {
      data.qtyRequest -= 1;
    }
  }

  isValidVariationQty(data: InnerVariationDetail) {
    if (this.isSalesOrder && this.salesOrderQuantityControl == "1") {
      if (((data.qtyRequest ?? 0) + 1) > data.actualQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
      }
    } else if (this.isSalesOrder && this.salesOrderQuantityControl == "2") {
      if (((data.qtyRequest ?? 0) + 1) > data.availableQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
      }
    }
  }

  increaseVariationQty(data: InnerVariationDetail) {
    if (this.isSalesOrder && this.salesOrderQuantityControl == "1") {
      if (((data.qtyRequest ?? 0) + 1) > data.actualQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded actual quantity [${data.actualQty}]`, "top", "warning", 1000);
      } else {
        data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      }
    } else if (this.isSalesOrder && this.salesOrderQuantityControl == "2") {
      if (((data.qtyRequest ?? 0) + 1) > data.availableQty) {
        data.qtyRequest = null;
        this.toastService.presentToast("Invalid Quantity", `Requested quantity exceeded available quantity [${data.availableQty}]`, "top", "warning", 1000);
      } else {
        data.qtyRequest = (data.qtyRequest ?? 0) + 1;
      }
    } else {
      data.qtyRequest = (data.qtyRequest ?? 0) + 1;
    }
  }

  addVariationToCart() {
    let isBlock = this.validateNewItemConversion(this.selectedItem)
    if (!isBlock) {
      if (this.selectedItem.variationDetails) {
        this.selectedItem.variationDetails.forEach(x => {
          x.details.forEach(y => {
            this.selectedItem.qtyRequest = (this.selectedItem.qtyRequest ?? 0) + y.qtyRequest;
          });
        })
      }
      setTimeout(async () => {
        await this.validateMinOrderQty(this.selectedItem);
        if (this.selectedItem.qtyRequest > 0) {
          // count total in cart
          this.availableItems.find(r => r.itemId === this.selectedItem.itemId).qtyInCart = this.availableItems.filter(r => r.itemId === this.selectedItem.itemId).flatMap(r => r.qtyInCart ?? 0).reduce((a, c) => a + c, 0) + this.selectedItem.qtyRequest;
          // count variation in cart
          this.availableItems.find(r => r.itemId === this.selectedItem.itemId).variationDetails.forEach(x => {
            x.details.forEach(y => {
              y.qtyInCart = (y.qtyInCart ?? 0) + this.selectedItem.variationDetails.flatMap(xx => xx.details).filter(yy => yy.qtyRequest && yy.qtyRequest > 0 && yy.itemSku === y.itemSku).flatMap(yy => yy.qtyRequest).reduce((a, c) => a + c, 0);
            })
          })
          setTimeout(() => {
            this.onItemAdded.emit(JSON.parse(JSON.stringify(this.selectedItem)));
            this.hideModal();
          }, 10);
        } else {
          this.hideModal();
        }
      }, 100);
    }
  }

  /* #endregion */

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  /* #endregion */

  /* #region validate new item id */

  validateNewItemConversion(found: TransactionDetail) {
    if (found.newItemId && found.newItemEffectiveDate && new Date(found.newItemEffectiveDate) <= new Date(this.objectHeader.trxDate)) {
      let newItemCode = this.configService.item_Masters.find(x => x.id == found.newItemId);
      if (newItemCode) {
        this.toastService.presentToast("Converted Code Detected", `Item ${found.itemCode} has been converted to ${newItemCode.code} effective from ${format(new Date(found.newItemEffectiveDate), "dd/MM/yyyy")}`, "top", "warning", 1000);
        if (this.systemWideBlockConvertedCode) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /* #endregion */

  /* #region check min order qty */

  validateMinOrderQty(data: TransactionDetail) {
    if (this.configOrderingActivateMOQControl) {
      if (this.objectHeader.businessModelType === "T" || this.objectHeader.businessModelType === "B") {
        if (data.qtyRequest && data.minOrderQty && data.qtyRequest < data.minOrderQty) {
          let sameItemInCart = this.availableItems.find(r => r.itemId === data.itemId);
          if (sameItemInCart && (sameItemInCart.qtyInCart ?? 0) > 0) {
            // check if qtyincart has same item if yes then check minorderqty again
            if (data.qtyRequest && data.minOrderQty && (data.qtyRequest + (sameItemInCart.qtyInCart ?? 0)) < data.minOrderQty) {
              // this.toastService.presentToast("Invalid Quantity", "Requested quantity [" + data.qtyRequest + "] is lower than minimum order quantity [" + data.minOrderQty + "]", "top", "warning", 1000);
              setTimeout(() => {
                data.minOrderQtyError = true;
              }, 10);
            } else {
              data.minOrderQtyError = false;
            }
          } else {
            // this.toastService.presentToast("Invalid Quantity", "Requested quantity [" + data.qtyRequest + "] is lower than minimum order quantity [" + data.minOrderQty + "]", "top", "warning", 1000);
            setTimeout(() => {
              data.minOrderQtyError = true;
            }, 10);
          }
        } else {
          data.minOrderQtyError = false;
        }
      } else {
        data.minOrderQtyError = false;
      }
    } else {
      data.minOrderQtyError = false;
    }
  }

  /* #endregion */

  async setFocus() {
    await this.searchbar.setFocus();
  }

}
