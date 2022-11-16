import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from '../../models/module-control';
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
    private toastService: ToastService,
    private barcodeScanInputService: BarcodeScanInputService
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

  handleKeyDown(e: any, key: string) {
    if (e.keyCode === 13) {
      let barcode = this.manipulateBarcodeCheckDigit(key);
      this.validateBarcode(barcode);
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
    if (barcode) {
      this.itemSearchValue = '';
      if (barcode && barcode.length > 12) {
        barcode = barcode.substring(0, 12);
      }
      if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
        let found = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
        if (found) {
          if (found.sku) {
            this.toastService.presentToast('Barcode found!', barcode, 'bottom', 'success', 1000);
            let outputData: any = { sku: found.sku, itemInfo: null };
            this.onItemAdd.emit(outputData);
          }
        } else {
          this.toastService.presentToast('Invalid Barcode', '', 'bottom', 'danger', 1000);
        }
      } else {
        this.barcodeScanInputService.getItemInfoByBarcode(barcode).subscribe(response => {
          console.log("🚀 ~ file: barcode-scan-input.page.ts ~ line 94 ~ BarcodeScanInputPage ~ this.barcodeScanInputService.getItemInfoByBarcode ~ response", response)
          if (response) {
            let outputData: any = { sku: response.itemSku, itemInfo: response };
            this.onItemAdd.emit(outputData);
          }
        }, error => {
          console.log(error);
        })
      }
    }
    this.barcodeInput.value = '';
    this.barcodeInput.setFocus();
  }

}
