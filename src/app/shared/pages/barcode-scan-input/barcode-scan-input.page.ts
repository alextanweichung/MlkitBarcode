import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from '../../models/module-control';
import { TransactionDetail } from '../../models/transaction-detail';
import { MasterListDetails } from '../../models/master-list-details';
import { Keyboard } from '@capacitor/keyboard';
import { PDItemMaster } from '../../models/pos-download';
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
        let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode.toUpperCase() === barcode.toUpperCase());
        if (found_barcode) {
          let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
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
  availableItems: TransactionDetail[] = [];
  @ViewChild('itemInput', { static: false }) itemInput: ElementRef;
  async validateItem(searchValue: string) {
    if (searchValue) {
      this.itemSearchValue = '';
      this.availableItems = [];
      let found_item_master = null;
      let found_item_barcode = null;
      if (this.configService.item_Masters && this.configService.item_Masters.length > 0) {
        let found = await this.configService.item_Masters.filter(r => r.code.length > 0).find(r => r.code.toUpperCase() === searchValue.toUpperCase()); // if found by itemCode
        if (found) {
          found_item_master = await this.configService.item_Masters.find(r => found.id === r.id);
        } else {
          let found2 = await this.configService.item_Barcodes.filter(r => r.sku.length > 0).find(r => r.sku.toUpperCase() === searchValue.toUpperCase()); // if found by itemSku
          if (found2) {
            found_item_master = await this.configService.item_Masters.find(r => found2.id === r.id);
          }
        }
        if (found_item_master) {
          found_item_barcode = await this.configService.item_Barcodes.filter(r => r.itemId === found_item_master.id);
        }
        if (found_item_barcode) {
          found_item_barcode.forEach(async r => {
            if (this.availableItems.findIndex(rr => rr.itemSku === r.sku) < 0) {
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
          this.toastService.presentToast('No Item Found', '', 'top', 'danger', 1000);
        }
        if (this.availableItems.length > 0) {
          if (this.availableItems.length === 1) {
            if (!this.validateNewItemConversion(found_item_master)) {
              this.onItemAdd.emit(this.availableItems);
            }
          } else {
            if (!this.validateNewItemConversion(found_item_master)) {
              this.showModal();
            }
          }
        } else {
          this.toastService.presentToast('Item Not Found', '', 'top', 'danger', 1000);
        }
      } else {
        this.toastService.presentToast('Something went wrong!', 'Local db not found.', 'top', 'danger', 1000);
      }
    }
  }

  /* #endregion */

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
