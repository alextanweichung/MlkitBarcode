import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Keyboard } from '@capacitor/keyboard';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from '../../models/master-list-details';
import { ModuleControl } from '../../models/module-control';
import { PDItemBarcode, PDItemMaster } from '../../models/pos-download';
import { TransactionDetail } from '../../models/transaction-detail';
import { CommonService } from '../../services/common.service';

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

  async handleBarcodeKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      let barcode = this.manipulateBarcodeCheckDigit(key);
      await this.validateBarcode(barcode);
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
  @ViewChild("barcodeInput", { static: false }) barcodeInput: ElementRef;
  async validateBarcode(barcode: string) {
    if (barcode) {
      this.barcodeSearchValue = "";
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
        let found_barcode = this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode.toUpperCase() === barcode.toUpperCase());
        if (found_barcode) {
          let found_item_master = this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
          let outputData: TransactionDetail = {
            itemId: found_item_master.id,
            itemCode: found_item_master.code,
            description: found_item_master.itemDesc,
            variationTypeCode: found_item_master.varCd,
            discountGroupCode: found_item_master.discCd,
            discountExpression: (found_item_master.discPct ?? "0") + "%",
            taxId: found_item_master.taxId,
            taxCode: found_item_master.taxCd,
            taxPct: found_item_master.taxPct,
            qtyRequest: null,
            itemPricing: {
              itemId: found_item_master.id,
              unitPrice: found_item_master.price,
              discountGroupCode: found_item_master.discCd,
              discountExpression: (found_item_master.discPct ?? "0") + "%",
              discountPercent: found_item_master.discPct ?? 0,
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
            itemDepartmentId: found_item_master.deptId,
            itemBarcodeTagId: found_barcode.id,
            newItemId: found_item_master.newId,
            newItemEffectiveDate: found_item_master.newDate
          }
          this.onItemAdd.emit([outputData]);
        } else {
          this.toastService.presentToast("", "Barcode not found.", "top", "danger", 1000);
        }
      } else {
        this.toastService.presentToast("Something went wrong!", "Local db not found.", "top", "danger", 1000);
      }
    }
  }

  async handleItemCodeKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      await this.validateItem(key);
      e.preventDefault();
      this.setFocus();
    }
  }

  itemSearchValue: string;
  availableItemmmm: TransactionDetail[] = [];
  availableVariations: TransactionDetail[] = [];
  @ViewChild("itemInput", { static: false }) itemInput: ElementRef;
  validateItem(searchValue: string) {
    if (searchValue) {
      this.itemSearchValue = "";
      this.availableItemmmm = [];
      this.availableVariations = [];
      this.availableVariationsByItemId = [];
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
              let t = found_item_barcode.find(rr => rr.itemId === r.id);
              if (t) {
                let outputData: TransactionDetail = {
                  itemId: r.id,
                  itemCode: r.code,
                  description: r.itemDesc,
                  variationTypeCode: r.varCd,
                  discountGroupCode: r.discCd,
                  discountExpression: (r.discPct ?? "0") + "%",
                  taxId: r.taxId,
                  taxCode: r.taxCd,
                  taxPct: r.taxPct,
                  qtyRequest: null,
                  itemPricing: {
                    itemId: r.id,
                    unitPrice: r.price,
                    discountGroupCode: r.discCd,
                    discountExpression: (r.discPct ?? "0") + "%",
                    discountPercent: r.discPct ?? 0,
                    discountGroupId: null,
                    unitPriceMin: null,
                    currencyId: null
                  },
                  itemSku: r.varCd === "0" ? found_item_barcode.find(rr => rr.itemId === r.id)?.sku : null,
                  itemBarcode: r.varCd === "0" ? found_item_barcode.find(rr => rr.itemId === r.id)?.barcode : null,
                  itemBrandId: r.brandId,
                  itemGroupId: r.groupId,
                  itemCategoryId: r.catId,
                  itemDepartmentId: r.deptId,
                  itemBarcodeTagId: r.varCd === "0" ? t.id : null
                }
                this.availableItemmmm.push(outputData);
              }
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
                discountExpression: (found_item_master.find(rr => rr.id === r.itemId)?.discPct ?? "0") + "%",
                taxId: found_item_master.find(rr => rr.id === r.itemId)?.taxId,
                taxCode: found_item_master.find(rr => rr.id === r.itemId)?.taxCd,
                taxPct: found_item_master.find(rr => rr.id === r.itemId)?.taxPct,
                qtyRequest: null,
                itemPricing: {
                  itemId: found_item_master.find(rr => rr.id === r.itemId)?.id,
                  unitPrice: found_item_master.find(rr => rr.id === r.itemId)?.price,
                  discountGroupCode: found_item_master.find(rr => rr.id === r.itemId)?.discCd,
                  discountExpression: (found_item_master.find(rr => rr.id === r.itemId)?.discPct ?? "0") + "%",
                  discountPercent: found_item_master.find(rr => rr.id === r.itemId)?.discPct ?? 0,
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
                itemDepartmentId: found_item_master.find(rr => rr.id === r.itemId)?.deptId,
                itemBarcodeTagId: r.id,
                newItemId: found_item_master.find(rr => rr.id === r.itemId)?.newId,
                newItemEffectiveDate: found_item_master.find(rr => rr.id === r.itemId)?.newDate
              }
              this.availableVariations.push(outputData);
            }
          })
        } else {
          this.toastService.presentToast("", "No Item Found", "top", "danger", 1000);
        }
        console.log("🚀 ~ file: barcode-scan-input.page.ts:263 ~ BarcodeScanInputPage ~ validateItem ~ found_item_master:", JSON.stringify(found_item_master))
        console.log("🚀 ~ file: barcode-scan-input.page.ts:271 ~ BarcodeScanInputPage ~ validateItem ~ this.availableVariations:", JSON.stringify(this.availableVariations))
        if (found_item_master && found_item_master.length === 1) { // only 1 item found
          this.availableVariationsByItemId = this.availableVariations.filter(r => r.itemId === found_item_master[0].id); // check if that one item has variation or not
          if (this.availableVariationsByItemId && this.availableVariationsByItemId.length > 1) { // if yes, then show variation modal
            this.showVariationModal();
          }
        } else if (found_item_master && found_item_master.length > 0 && this.availableVariations && this.availableVariations.length > 0) { // if item found, and has barcode tag
          this.showItemModal();
        }
      } else {
        this.toastService.presentToast("Something went wrong!", "Local db not found.", "top", "danger", 1000);
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
      if (item) {
        let found = this.configService.item_Masters.find(r => r.id === item.itemId);
        this.onItemAdd.emit([item]);
      } else {
        this.toastService.presentToast("", "No Item added.", "top", "danger", 1000);
      }
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
    let found = this.availableVariationsByItemId.filter(r => r.isSelected)
    if (found.length > 0) {
      let found_item_master = this.configService.item_Masters.find(r => r.id === found[0]);
      this.onItemAdd.emit(this.availableVariationsByItemId.filter(r => r.isSelected));
    }
    else {
      this.toastService.presentToast("", "No Item added.", "top", "danger", 1000);
    }
    this.hideVariationModel();
    this.hideItemModel();
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

}
