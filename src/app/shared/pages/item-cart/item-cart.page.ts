import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from '../../models/item-list';

@Component({
  selector: 'app-item-cart',
  templateUrl: './item-cart.page.html',
  styleUrls: ['./item-cart.page.scss'],
})
export class ItemCartPage implements OnInit, OnChanges {

  @Input() itemInCart: Item[] = [];
  @Output() onItemInCartEditCompleted: EventEmitter<Item[]> = new EventEmitter();

  constructor(
    private alertController: AlertController,
    private toastService: ToastService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemInCart) {
      this.combineItemWithVariations();
    }
  }

  ngOnInit() {

  }

  itemToDisplay: ItemList[] = [];
  combineItemWithVariations() {
    this.itemToDisplay = [];
    if (this.itemInCart.length > 0) {
      const itemIds = [...new Set(this.itemInCart.map(r => r.itemId))];
      itemIds.forEach(r => {
        let oneItem = this.itemInCart.find(rr => rr.itemId === r);
        this.itemToDisplay.push({
          itemId: r,
          itemCode: oneItem.itemCode,
          itemSku: oneItem.itemSku,
          description: oneItem.description,
          unitPrice: oneItem.unitPrice,
          variationTypeCode: oneItem.variationTypeCode,
          qtyRequest: oneItem.qtyRequest
        })
      })
    }
  }

  decreaseQty(item) {
    item.qtyRequest--;
    if (item.variationTypeCode === '0') {
      this.itemInCart.find(r => r.itemId === item.itemId).qtyRequest = item.qtyRequest;
    }
    if (item.qtyRequest === 0) {
      this.presentDeleteAlert(item.itemSku);
    }
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  increaseQty(item) {
    item.qtyRequest++;
    if (item.variationTypeCode === '0') {
      this.itemInCart.find(r => r.itemId === item.itemId).qtyRequest = item.qtyRequest;
    }
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  resetQtyBackToOne(itemSku: string) {
    this.itemInCart.find(r => r.itemSku === itemSku).qtyRequest = 1;
    this.combineItemWithVariations();

    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  qtyChanged() {
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  getVariationSum(item: ItemList) {
    return this.itemInCart.filter(r => r.itemId === item.itemId).flatMap(r => r.qtyRequest).reduce((a, c) => Number(a) + Number(c));
  }

  getVariations(item: ItemList) {
    return this.itemInCart.filter(r => r.itemId === item.itemId);
  }

  async presentDeleteAlert(itemSku: string) {
    const alert = await this.alertController.create({
      header: 'Are you sure to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.resetQtyBackToOne(itemSku);
          }
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.removeItemBySku(itemSku);
          },
        },
      ],
    });

    await alert.present();
  }

  async presentDeleteItemAlert(itemId: number) {
    const alert = await this.alertController.create({
      header: 'Are you sure to delete?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.removeItemById(itemId);
          },
        },
      ],
    });

    await alert.present();
  }

  removeItemBySku(itemSku: string) {
    this.itemInCart.splice(this.itemInCart.findIndex(r => r.itemSku === itemSku), 1);
    this.combineItemWithVariations();
    this.onItemInCartEditCompleted.emit(this.itemInCart);
    this.toastService.presentToast('Delete successful', 'Item has been removed from cart.', 'bottom', 'success', 1500);
  }

  removeItemById(itemId: number) {
    this.itemInCart = this.itemInCart.filter(r => r.itemId !== itemId);
    this.combineItemWithVariations();
    this.onItemInCartEditCompleted.emit(this.itemInCart);
    this.toastService.presentToast('Delete successful', 'Item has been removed from cart.', 'bottom', 'success', 1500);
  }

}
