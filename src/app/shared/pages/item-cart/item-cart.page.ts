import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Item } from 'src/app/modules/transactions/models/item';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ItemList } from '../../models/item-list';
import { MasterListDetails } from '../../models/master-list-details';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-item-cart',
  templateUrl: './item-cart.page.html',
  styleUrls: ['./item-cart.page.scss'],
})
export class ItemCartPage implements OnInit, OnChanges {

  @Input() itemInCart: Item[] = [];
  @Input() useTax: boolean;
  @Input() maxPrecision: number = 2;
  @Input() maxPrecisionTax: number = 2;
  @Input() isDisplayTaxInclusive: boolean = true;
  @Input() discountGroupMasterList: MasterListDetails[] = [];
  @Input() showDetails: boolean = false;
  @Input() isItemPriceTaxInclusive: boolean = false;
  @Output() onItemInCartEditCompleted: EventEmitter<Item[]> = new EventEmitter();

  constructor(
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService,
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
          unitPriceExTax: oneItem.unitPriceExTax,
          discountGroupCode: oneItem.discountGroupCode,
          discountExpression: oneItem.discountExpression,
          discountAmt: oneItem.discountAmt,
          discountAmtExTax: oneItem.discountAmtExTax,
          taxId: oneItem.taxId,
          taxPct: oneItem.taxPct,
          subTotal: oneItem.subTotal,
          subTotalExTax: oneItem.subTotalExTax,
          variationTypeCode: oneItem.variationTypeCode,
          qtyRequest: oneItem.qtyRequest
        })
      })
    }
  }

  async decreaseQty(item) {
    item.qtyRequest--;
    if (item.variationTypeCode === '0') {
      this.itemInCart.find(r => r.itemId === item.itemId).qtyRequest = item.qtyRequest;
    }
    if (item.qtyRequest === 0) {
      this.presentDeleteAlert(item.itemSku);
    }
    await this.computeAllAmount();
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  async increaseQty(item) {
    item.qtyRequest++;
    if (item.variationTypeCode === '0') {
      this.itemInCart.find(r => r.itemId === item.itemId).qtyRequest = item.qtyRequest;
    }
    await this.computeAllAmount();
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  async resetQtyBackToOne(itemSku: string) {
    this.itemInCart.find(r => r.itemSku === itemSku).qtyRequest = 1;
    this.combineItemWithVariations();
    await this.computeAllAmount();
    this.onItemInCartEditCompleted.emit(this.itemInCart);
  }

  async qtyChanged() {
    await this.computeAllAmount();
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

  async removeItemBySku(itemSku: string) {
    this.itemInCart.splice(this.itemInCart.findIndex(r => r.itemSku === itemSku), 1);
    this.combineItemWithVariations();
    await this.computeAllAmount();
    this.onItemInCartEditCompleted.emit(this.itemInCart);
    this.toastService.presentToast('Delete successful', 'Item has been removed from cart.', 'bottom', 'success', 1000);
  }

  async removeItemById(itemId: number) {
    this.itemInCart = this.itemInCart.filter(r => r.itemId !== itemId);
    this.combineItemWithVariations();
    await this.computeAllAmount();
    this.onItemInCartEditCompleted.emit(this.itemInCart);
    this.toastService.presentToast('Delete successful', 'Item has been removed from cart.', 'bottom', 'success', 1000);
  }

  /* #region  modify line details */

  selectedItemLine: ItemList;
  showLineDetails(item: ItemList) {
    this.selectedItemLine = item;
    this.selectedItemLine = this.commonService.computeDiscTaxAmount(this.selectedItemLine, this.useTax, this.isItemPriceTaxInclusive, this.maxPrecision);
    this.showItemModal();
  }

  isModalOpen: boolean = false;
  showItemModal() {
    this.isModalOpen = true;
  }

  hideItemModal() {    
    this.itemInCart.filter(r => r.itemId === this.selectedItemLine.itemId).forEach(r => {
      r.unitPrice = this.selectedItemLine.unitPrice;
      r.unitPriceExTax = this.selectedItemLine.unitPriceExTax;
      r.discountGroupCode = this.selectedItemLine.discountGroupCode;
      r.discountExpression = this.selectedItemLine.discountExpression;
      r.discountAmt = this.selectedItemLine.discountAmt;
      r.discountAmtExTax = this.selectedItemLine.discountAmtExTax;
      r.taxAmt = this.selectedItemLine.taxAmt;
      r.taxInclusive = this.selectedItemLine.taxInclusive;
      r.subTotal = this.selectedItemLine.subTotal;
      r.subTotalExTax = this.selectedItemLine.subTotalExTax;
    })
    this.isModalOpen = false;
  }

  setSelect(input) {
    input.getInputElement().then(r => {
      r.select();
    })
  }

  async onDiscountGroupChanged() {
    let lookupvalue = this.discountGroupMasterList.find(r => r.code === this.selectedItemLine.discountGroupCode);
    if (lookupvalue) {
      this.itemInCart.find(r => r.itemId === this.selectedItemLine.itemId).discountExpression = lookupvalue.attribute1 + "%";
      this.selectedItemLine.discountExpression = lookupvalue.attribute1 + "%";
    } else {
      this.itemInCart.find(r => r.itemId === this.selectedItemLine.itemId).discountExpression = null;
      this.selectedItemLine.discountExpression = null;
    }
    this.selectedItemLine = this.commonService.computeDiscTaxAmount(this.selectedItemLine, this.useTax, this.isItemPriceTaxInclusive, this.maxPrecision);
    await this.computeAllAmount();
  }

  /* #endregion */

  /* #region  tax handle here */

  async computeAllAmount() {
    await this.itemInCart.forEach(r => {
      // r = this.assignLineUnitPrice(r);
      if (this.isItemPriceTaxInclusive) {
        this.computeUnitPriceExTax(r);
      } else {
        this.computeUnitPrice(r);
      }
    })
  }

  computeUnitPriceExTax(trxLine: Item) {
    trxLine.unitPriceExTax = this.commonService.computeUnitPriceExTax(trxLine, this.useTax, this.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
    // this.onEditComplete();
  }

  computeUnitPrice(trxLine: Item) {
    trxLine.unitPriceExTax = trxLine.unitPrice;
    trxLine.unitPrice = this.commonService.computeUnitPrice(trxLine, this.useTax, this.maxPrecision);
    this.computeDiscTaxAmount(trxLine);
    // this.onEditComplete();
  }

  computeDiscTaxAmount(trxLine: Item) {
    trxLine = this.commonService.computeDiscTaxAmount(trxLine, this.useTax, this.isItemPriceTaxInclusive, this.maxPrecision);
    // this.onEditComplete();
  }

  assignLineUnitPrice(item: Item) {
    if (this.useTax) {
      if (this.isItemPriceTaxInclusive) {
        item.unitPrice = item.unitPrice;
        item.unitPriceExTax = this.commonService.computeAmtExclTax(item.unitPrice, item.taxPct);
      } else {
        item.unitPrice = this.commonService.computeAmtInclTax(item.unitPrice, item.taxPct);
        item.unitPriceExTax = item.unitPrice;
      }
    } else {
      item.unitPrice = item.unitPrice;
      item.unitPriceExTax = item.unitPrice;
    }
    item.unitPrice = this.commonService.roundToPrecision(item.unitPrice, this.maxPrecision);
    item.unitPriceExTax = this.commonService.roundToPrecision(item.unitPriceExTax, this.maxPrecision);
    return item;
  }

  /* #endregion */

}
