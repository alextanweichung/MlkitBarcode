import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Item } from 'src/app/modules/transactions/models/item';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from '../../models/item-list';

@Component({
  selector: 'app-item-add-list',
  templateUrl: './item-add-list-variation-modal.page.html',
  styleUrls: ['./item-add-list-variation-modal.page.scss'],
})
export class ItemAddListVariationModalPage implements OnInit, OnChanges {

  @Input() useTax: boolean = false;
  @Input() availableItem: Item[] = [];
  @Input() itemInCart: Item[] = [];
  itemToDisplay: ItemList[] = [];
  
  @Output() onItemInCartEditCompleted: EventEmitter<Item[]> = new EventEmitter();

  constructor(
    private toastService: ToastService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.availableItem) {
      this.distinctItem();
    }
  }

  ngOnInit() {
  }


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
          unitPrice: this.useTax ? oneItem.unitPrice : oneItem.unitPriceExTax,
          variationTypeCode: oneItem.variationTypeCode
        })
      })
    }
  }

  decreaseQty(data: ItemList) {
    // only for variationTypeCode === '0'
    // this.ngZone.run(() => {
    if (isNaN(data.qtyRequest) || data.qtyRequest === 0) {
      data.qtyRequest = 0;
    } else {
      if ((data.qtyRequest - 1) > 0) {
        data.qtyRequest = (data.qtyRequest ?? 0) - 1;
      } else {
        data.qtyRequest = 0;
      }
    }
    // })
  }

  increaseQty(data: ItemList) {
    // only for variationTypeCode === '0'
    // this.ngZone.run(() => {
    data.qtyRequest = (data.qtyRequest ?? 0) + 1;
    // })
  }

  addItemToCart(data: ItemList) {
    // only for variationTypeCode === '0'
    if (this.itemInCart.findIndex(r => r.itemId === data.itemId && r.variationTypeCode === '0') > -1) {
      this.itemInCart.find(r => r.itemId === data.itemId && r.variationTypeCode === '0').qtyRequest += data.qtyRequest;
    } else {
      let d = this.availableItem.find(r => r.itemId === data.itemId && r.variationTypeCode === '0');
      d.qtyRequest = data.qtyRequest;
      this.itemInCart.push(JSON.parse(JSON.stringify(d)));
    }    
    data.qtyRequest = null;
    this.toastService.presentToast('Success', 'Item successfully added to cart.', 'bottom', 'success', 1000);
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  isModalOpen: boolean = false;
  itemToViewVariation: Item[] = [];
  showModal(itemId: number) {
    this.itemToViewVariation = this.availableItem.filter(r => r.itemId === itemId);
    this.isModalOpen = true;
  }

  hideModal() {
    this.itemToViewVariation = [];
    this.isModalOpen = false;
  }

  increaseVariationQty(item: Item) {
    // only for variationTypeCode !== '0'    
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
    this.toastService.presentToast('Success', 'Item successfully added to cart.', 'bottom', 'success', 1000);
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }
  
}
