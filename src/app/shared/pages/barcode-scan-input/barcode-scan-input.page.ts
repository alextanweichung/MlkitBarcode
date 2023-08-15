import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from '../../models/module-control';
import { TransactionDetail } from '../../models/transaction-detail';
import { MasterListDetails } from '../../models/master-list-details';
import { Keyboard } from '@capacitor/keyboard';
import { PDItemBarcode, PDItemMaster } from '../../models/pos-download';
import { CommonService } from '../../services/common.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-barcode-scan-input',
  templateUrl: './barcode-scan-input.page.html',
  styleUrls: ['./barcode-scan-input.page.scss'],
})
export class BarcodeScanInputPage implements OnInit {

  @Input() itemVariationXMasterList: MasterListDetails[] = [];
  @Input() itemVariationYMasterList: MasterListDetails[] = [];

  moduleControl: ModuleControl[];
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  systemWideScanningMethod: string;
  systemWideBlockConvertedCode: boolean = false;

  selectedScanningMethod: string = "B";

  @Output() onItemAdd = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadModuleControl();
  }

  showKeyboard(event) {
    event.preventDefault();
    this.setFocus();
    setTimeout(async () => {
      await Keyboard.show();
    }, 100);
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;

      let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
      if (ignoreCheckdigit != undefined) {
        this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
      }

      let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
      if (scanningMethod != undefined) {
        this.systemWideScanningMethod = scanningMethod.ctrlValue;
      }

      let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
      if (blockConvertedCode) {
        this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
      } else {
        this.systemWideBlockConvertedCode = false;
      }

    }, error => {
      console.log(error);
    })
  }

  handleBarcodeKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      let barcode = this.manipulateBarcodeCheckDigit(key);
      this.validateBarcode(barcode);
      e.preventDefault();
      this.setFocus();
    }
  }

  manipulateBarcodeCheckDigit(itemBarcode: string) {
    if (itemBarcode) {
      if (this.systemWideEAN13IgnoreCheckDigit) {
        if (itemBarcode.length == 13) {
          itemBarcode = itemBarcode.substring(0, itemBarcode.length - 1);
        }
      }
    }
    return itemBarcode;
  }

  /* #region scan */

  barcodeSearchValue: string;
  @ViewChild('barcodeInput', { static: false }) barcodeInput: ElementRef;
  async validateBarcode(barcode: string) {
    if (barcode) {
      this.barcodeSearchValue = '';
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
        let found_barcode = this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode.toUpperCase() === barcode.toUpperCase());
        if (found_barcode) {
          let found_item_master = this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
          console.log("🚀 ~ file: barcode-scan-input.page.ts:103 ~ BarcodeScanInputPage ~ validateBarcode ~ found_item_master:", JSON.stringify(found_item_master))
          let outputData: TransactionDetail = {
            itemId: found_item_master.id,
            itemCode: found_item_master.code,
            description: found_item_master.itemDesc,
            variationTypeCode: found_item_master.varCd,
            discountGroupCode: found_item_master.discCd,
            discountExpression: found_item_master.discPct + '%',
            taxId: found_item_master.taxId,
            taxCode: found_item_master.taxCd,
            taxPct: found_item_master.taxPct,
            qtyRequest: null,
            itemPricing: {
              itemId: found_item_master.id,
              unitPrice: found_item_master.price,
              discountGroupCode: found_item_master.discCd,
              discountExpression: found_item_master.discPct + '%',
              discountPercent: found_item_master.discPct,
              discountGroupId: null,
              unitPriceMin: null,
              currencyId: null
            },
            itemVariationXId: found_barcode.xId,
            itemVariationYId: found_barcode.yId,
            itemSku: found_barcode.sku,
            itemBarcode: found_barcode.barcode,
            itemBrandId: found_item_master.brandId,
            itemGroupId: found_item_master.groupId,
            itemCategoryId: found_item_master.catId,
            itemBarcodeTagId: found_barcode.id
          }
          if (!this.validateNewItemConversion(found_item_master)) {
            this.onItemAdd.emit([outputData]);
          }
        } else {
          this.toastService.presentToast('', 'Barcode not found.', 'top', 'danger', 1000);
        }
      } else {
        this.toastService.presentToast('Something went wrong!', 'Local db not found.', 'top', 'danger', 1000);
      }
    }
  }

  handleItemCodeKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      this.validateItem(key);
      e.preventDefault();
      this.setFocus();
    }
  }

  itemSearchValue: string;
  availableItemmmm: TransactionDetail[] = [];
  availableVariations: TransactionDetail[] = [];
  @ViewChild('itemInput', { static: false }) itemInput: ElementRef;
  validateItem(searchValue: string) {
    console.log("🚀 ~ file: barcode-scan-input.page.ts:163 ~ BarcodeScanInputPage ~ validateItem ~ searchValue:", searchValue)
    if (searchValue) {
      this.itemSearchValue = '';
      this.availableItemmmm = [];
      this.availableVariations = [];
      let found_item_master: PDItemMaster[] = [];
      let found_item_barcode: PDItemBarcode[] = [];
      if (this.configService.item_Masters && this.configService.item_Masters.length > 0) {
        let found = this.configService.item_Masters.filter(r => r.code.length > 0).filter(r => r.code.toUpperCase().includes(searchValue.toUpperCase())); // if found by itemCode
        if (found && found.length > 0) {
          found_item_master = this.configService.item_Masters.filter(r => found.flatMap(rr => rr.id).includes(r.id));
        } else {
          let found2 = this.configService.item_Barcodes.filter(r => r.sku.length > 0).filter(r => r.sku.toUpperCase().includes(searchValue.toUpperCase())); // if found by itemSku
          if (found2) {
            found_item_master = this.configService.item_Masters.filter(r => found2.flatMap(rr => rr.id).includes(r.id));
          }
        }
        if (found_item_master && found_item_master.length > 0) {
          found_item_barcode = this.configService.item_Barcodes.filter(r => found_item_master.flatMap(rr => rr.id).includes(r.itemId));

          found_item_master.forEach(r => {
            if (this.availableItemmmm.findIndex(rr => rr.itemCode === r.code) < 0) {
              console.log("🚀 ~ file: barcode-scan-input.page.ts:221 ~ BarcodeScanInputPage ~ validateItem ~ r:", JSON.stringify(r))
              console.log("🚀 ~ file: barcode-scan-input.page.ts:187 ~ BarcodeScanInputPage ~ validateItem ~ r.varCd:", r.varCd)
              let t = found_item_barcode.find(rr => rr.itemId === r.id);
              console.log("🚀 ~ file: barcode-scan-input.page.ts:188 ~ BarcodeScanInputPage ~ validateItem ~ t:", JSON.stringify(t))
              let outputData: TransactionDetail = {
                itemId: r.id,
                itemCode: r.code,
                description: r.itemDesc,
                variationTypeCode: r.varCd,
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
                  discountPercent: r.discPct,
                  discountGroupId: null,
                  unitPriceMin: null,
                  currencyId: null
                },
                // itemVariationXId: r.xId,
                // itemVariationYId: r.yId,
                itemSku: r.varCd === "0" ? found_item_barcode.find(rr => rr.itemId === r.id)?.sku : null,
                itemBarcode: r.varCd === "0" ? found_item_barcode.find(rr => rr.itemId === r.id)?.barcode : null,
                itemBrandId: r.brandId,
                itemGroupId: r.groupId,
                itemCategoryId: r.catId
              }
              this.availableItemmmm.push(outputData);
            }
          })
        }

        if (found_item_barcode && found_item_barcode.length > 0) {
          found_item_barcode.forEach(async r => {
            if (this.availableVariations.findIndex(rr => rr.itemSku === r.sku) < 0) {
              let outputData: TransactionDetail = {
                itemId: r.itemId,
                itemCode: found_item_master.find(rr => rr.id === r.itemId)?.code,
                description: found_item_master.find(rr => rr.id === r.itemId)?.itemDesc,
                variationTypeCode: found_item_master.find(rr => rr.id === r.itemId)?.varCd,
                discountGroupCode: found_item_master.find(rr => rr.id === r.itemId)?.discCd,
                discountExpression: found_item_master.find(rr => rr.id === r.itemId)?.discPct + '%',
                taxId: found_item_master.find(rr => rr.id === r.itemId)?.taxId,
                taxCode: found_item_master.find(rr => rr.id === r.itemId)?.taxCd,
                taxPct: found_item_master.find(rr => rr.id === r.itemId)?.taxPct,
                qtyRequest: null,
                itemPricing: {
                  itemId: found_item_master.find(rr => rr.id === r.itemId)?.id,
                  unitPrice: found_item_master.find(rr => rr.id === r.itemId)?.price,
                  discountGroupCode: found_item_master.find(rr => rr.id === r.itemId)?.discCd,
                  discountExpression: found_item_master.find(rr => rr.id === r.itemId)?.discPct + '%',
                  discountPercent: found_item_master.find(rr => rr.id === r.itemId)?.discPct,
                  discountGroupId: null,
                  unitPriceMin: null,
                  currencyId: null
                },
                itemVariationXId: r.xId,
                itemVariationYId: r.yId,
                itemSku: r.sku,
                itemBarcode: r.barcode,
                itemBrandId: found_item_master.find(rr => rr.id === r.itemId)?.brandId,
                itemGroupId: found_item_master.find(rr => rr.id === r.itemId)?.groupId,
                itemCategoryId: found_item_master.find(rr => rr.id === r.itemId)?.catId,
                itemBarcodeTagId: r.id
              }
              this.availableVariations.push(outputData);
            }
          })
        } else {
          this.toastService.presentToast('No Item Found', '', 'top', 'danger', 1000);
        }
        // if (this.availableItems.length > 0) {
        //   if (this.availableItems.length === 1) {
        //     if (!this.validateNewItemConversion(found_item_master)) {
        //       this.onItemAdd.emit(this.availableItems);
        //     }
        //   } else {
        //     if (!this.validateNewItemConversion(found_item_master)) {
        if (found_item_master && found_item_master.length === 1) {
          this.showVariationModal();
        } else {
          this.showItemModal();
        }
        //     }
        //   }
        // } else {
        //   this.toastService.presentToast('Item Not Found', '', 'top', 'danger', 1000);
        // }
      } else {
        this.toastService.presentToast('Something went wrong!', 'Local db not found.', 'top', 'danger', 1000);
      }
    }
  }

  /* #endregion */

  /* #region modal for user to select item (if more than 1 item found when they search) */

  itemModalOpen: boolean = false;
  showItemModal() {
    this.itemModalOpen = true;
  }

  hideItemModel() {
    this.itemModalOpen = false;
  }

  availableVariationsByItemId: TransactionDetail[] = [];
  showVariations(item: TransactionDetail) {
    this.availableVariationsByItemId = [];
    if (item.variationTypeCode === "0") {
      this.onItemAdd.emit([item]);
      this.hideItemModel();
    }
    else {
      this.availableVariationsByItemId = this.availableVariations.filter(r => r.itemId === item.itemId);
      this.showVariationModal();
    }
  }

  /* #endregion */

  /* #region modal for user to select item variation (final layer) */

  variationModalOpen: boolean = false;
  showVariationModal() {
    this.variationModalOpen = true;
  }

  hideVariationModel() {
    this.variationModalOpen = false;
  }

  addVariations() {
    this.onItemAdd.emit(this.availableVariations.filter(r => r.isSelected));
    this.hideItemModel();
    this.hideVariationModel();
  }

  /* #endregion */

  /* #region focus */

  scanningMethodChanged() {
    setTimeout(() => {
      this.setFocus();
    }, 100);
  }

  setFocus() {
    if (this.selectedScanningMethod === "B") {
      this.focusBarcodeSearch();
    } else {
      this.focusItemSearch();
    }
  }

  focusBarcodeSearch() {
    this.barcodeInput.nativeElement.focus();
  }

  focusItemSearch() {
    this.itemInput.nativeElement.focus();
  }

  /* #endregion */

  /* #region validate new item id */

  validateNewItemConversion(found: PDItemMaster) {
    if (found.newId && found.newDate && this.commonService.convertUtcDate(found.newDate) <= this.commonService.convertUtcDate(this.commonService.getTodayDate())) {
      let newItemCode = this.configService.item_Masters.find(x => x.id == found.newId);
      if (newItemCode) {
        this.toastService.presentToast("Converted Code Detected", `Item ${found.code} has been converted to ${newItemCode.code} effective from ${format(this.commonService.convertUtcDate(found.newDate), 'dd/MM/yyyy')}`, 'top', 'warning', 1750);
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

}
