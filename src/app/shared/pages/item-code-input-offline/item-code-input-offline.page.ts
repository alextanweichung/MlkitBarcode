import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from '../../models/master-list-details';
import { TransactionDetail } from '../../models/transaction-detail';

@Component({
  selector: 'app-item-code-input-offline',
  templateUrl: './item-code-input-offline.page.html',
  styleUrls: ['./item-code-input-offline.page.scss'],
})
export class ItemCodeInputOfflinePage implements OnInit {

  @Input() itemVariationXMasterList: MasterListDetails[] = [];
  @Input() itemVariationYMasterList: MasterListDetails[] = [];  
  @Output() onItemAdd = new EventEmitter<TransactionDetail[]>();

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter(): void {
    this.barcodeInput.nativeElement.focus();
  }

  handleKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      this.validateBarcode(key);
      e.preventDefault();
    }
  }

  itemSearchValue: string;
  availableItems: TransactionDetail[] = [];
  @ViewChild('barcodeInput', { static: false }) barcodeInput: ElementRef;
  async validateBarcode(searchValue: string) {
    if (searchValue) {
      this.itemSearchValue = '';
      this.availableItems = [];
      if (this.configService.item_Masters && this.configService.item_Masters.length > 0) {
        
        let found = await this.configService.item_Masters.filter(r => r.code.length > 0).find(r => r.code.toUpperCase() === searchValue.toUpperCase()); // if found by itemCode
        if (found) {
          let found_item_master = await this.configService.item_Masters.find(r => found.id === r.id);
          let found_item_barcode = await this.configService.item_Barcodes.filter(r => r.itemId === found_item_master.id);
          found_item_barcode.forEach(async r => {
            if (this.availableItems.findIndex(rr => rr.itemSku === r.sku) < 0) {
              let outputData: TransactionDetail = {
                itemId: found_item_master.id,
                itemCode: found_item_master.code,
                description: found_item_master.itemDesc,
                variationTypeCode: found_item_master.varCd,
                discountGroupCode: found_item_master.discCd,
                discountExpression: (found_item_master.discPct??"0") + '%',
                taxId: found_item_master.taxId,
                taxCode: found_item_master.taxCd,
                taxPct: found_item_master.taxPct,
                qtyRequest: null,
                itemPricing: {
                  itemId: found_item_master.id,
                  unitPrice: found_item_master.price,
                  discountGroupCode: found_item_master.discCd,
                  discountExpression: (found_item_master.discPct??"0") + '%',
                  discountPercent: found_item_master.discPct??0,
                  discountGroupId: null,
                  unitPriceMin: null,
                  currencyId: null
                },
                itemVariationXId: r.xId,
                itemVariationYId: r.yId,
                itemSku: r.sku,
                itemBarcode: r.barcode,
                itemBrandId: found_item_master.brandId,
                itemGroupId: found_item_master.groupId,
                itemCategoryId: found_item_master.catId,
                itemBarcodeTagId: r.id
              }
              await this.availableItems.push(outputData);
            }
          })
        } else {
          let found2 = await this.configService.item_Barcodes.filter(r => r.sku.length > 0).find(r => r.sku.toUpperCase() === searchValue.toUpperCase()); // if found by itemSku
          let found_item_master = await this.configService.item_Masters.find(r => found2.id === r.id);
          let found_item_barcode = await this.configService.item_Barcodes.filter(r => r.itemId === found_item_master.id);
          found_item_barcode.forEach(async r => {
            if (this.availableItems.findIndex(rr => rr.itemSku === r.sku) < 0) {
              let outputData: TransactionDetail = {
                itemId: found_item_master.id,
                itemCode: found_item_master.code,
                description: found_item_master.itemDesc,
                variationTypeCode: found_item_master.varCd,
                discountGroupCode: found_item_master.discCd,
                discountExpression: (found_item_master.discPct??"0") + '%',
                taxId: found_item_master.taxId,
                taxCode: found_item_master.taxCd,
                taxPct: found_item_master.taxPct,
                qtyRequest: null,
                itemPricing: {
                  itemId: found_item_master.id,
                  unitPrice: found_item_master.price,
                  discountGroupCode: found_item_master.discCd,
                  discountExpression: (found_item_master.discPct??"0") + '%',
                  discountPercent: found_item_master.discPct??0,
                  discountGroupId: null,
                  unitPriceMin: null,
                  currencyId: null
                },
                itemVariationXId: r.xId,
                itemVariationYId: r.yId,
                itemSku: r.sku,
                itemBarcode: r.barcode,
                itemBrandId: found_item_master.brandId,
                itemGroupId: found_item_master.groupId,
                itemCategoryId: found_item_master.catId,
                itemBarcodeTagId: r.id
              }
              await this.availableItems.push(outputData);
            }
          })
        }
        if (this.availableItems.length > 0) {
          this.showModal();
        } else {
          this.toastService.presentToast('No Item Found', '', 'top', 'danger', 1000);            
        }
      } else {
        this.toastService.presentToast('Something went wrong!', 'Local db not found.', 'top', 'danger', 1000);
      }
    }
    this.barcodeInput.nativeElement.focus();
  }

  /* #region modal for user to select item */

  isModalOpen: boolean = false;

  showModal() {
    this.isModalOpen = true;
  }

  hideModal() {
    this.isModalOpen = false;
  }

  selectItems() {
    this.onItemAdd.emit(this.availableItems.filter(r => r.isSelected));
    this.hideModal();
  }

  /* #endregion */

}