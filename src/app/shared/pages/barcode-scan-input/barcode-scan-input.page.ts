import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from '../../models/module-control';
import { TransactionDetail } from '../../models/transaction-detail';
import { BarcodeScanInputService } from '../../services/barcode-scan-input.service';

@Component({
  selector: 'app-barcode-scan-input',
  templateUrl: './barcode-scan-input.page.html',
  styleUrls: ['./barcode-scan-input.page.scss'],
})
export class BarcodeScanInputPage implements OnInit {

  moduleControl: ModuleControl[];
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  systemWideScanningMethod: string;

  @Output() onItemAdd = new EventEmitter<any>();

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadModuleControl();
  }

  ionViewDidEnter(): void {
    this.barcodeInput.setFocus();
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
    }, error => {
      console.log(error);
    })
  }

  async handleKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      let barcode = this.manipulateBarcodeCheckDigit(key);
      await this.validateBarcode(barcode);
      e.preventDefault();
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

  itemSearchValue: string;
  @ViewChild('barcodeInput', { static: false }) barcodeInput: IonInput;
  async validateBarcode(barcode: string) {
    console.log("🚀 ~ file: barcode-scan-input.page.ts:75 ~ BarcodeScanInputPage ~ validateBarcode ~ barcode", barcode)
    if (barcode) {
      this.itemSearchValue = '';
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
        let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
        if (found_barcode) {
          this.toastService.presentToast('Barcode found!', barcode, 'middle', 'success', 1000);
          let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
          let outputData: TransactionDetail = {
            itemId: found_item_master.id,
            itemCode: found_item_master.code,
            description: found_item_master.itemDesc,
            variationTypeCode: found_item_master.varCd,
            discountGroupCode: found_item_master.discCd,
            discountExpression: found_item_master.discPct+'%',
            taxId: found_item_master.taxId,
            taxCode: found_item_master.taxCd,
            taxPct: found_item_master.taxPct,
            qtyRequest: null,
            itemPricing: {
              itemId: found_item_master.id,
              unitPrice: found_item_master.price,
              discountGroupCode: found_item_master.discCd,
              discountExpression: found_item_master.discPct+'%',
              discountPercent: found_item_master.discPct
            },
            itemVariationXId: found_barcode.xId,
            itemVariationYId: found_barcode.yId,
            itemSku: found_barcode.sku,
            itemBarcode: found_barcode.barcode
          }
          console.log("🚀 ~ file: barcode-scan-input.page.ts:107 ~ BarcodeScanInputPage ~ validateBarcode ~ outputData", JSON.stringify(outputData))
          this.onItemAdd.emit(outputData);
        } else {
          this.toastService.presentToast('Invalid Barcode', '', 'middle', 'danger', 1000);
        }
      } else {
        this.toastService.presentToast('Something went wrong!', 'Local db not found.', 'middle', 'medium', 1000);
      }
    }
    this.barcodeInput.value = '';
    this.barcodeInput.setFocus();
  }

}
