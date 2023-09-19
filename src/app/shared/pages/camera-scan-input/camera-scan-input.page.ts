import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
  Output,
} from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-camera-scan-input',
  templateUrl: './camera-scan-input.page.html',
  styleUrls: ['./camera-scan-input.page.scss'],
})
export class CameraScanInputPage implements OnInit, OnDestroy {

  isButtonVisible: boolean = true;

  @Input() scanActive: boolean;
  @Input() systemWideEAN13IgnoreCheckDigit: boolean;
  @Output() onCameraStatusChanged = new EventEmitter<boolean>();
  @Output() onDoneScanning = new EventEmitter<string>();

  constructor(
    private alertController: AlertController
  ) {}

  ngOnDestroy(): void {
    // this.keyboard.onKeyboardWillShow().unsubscribe();
    // this.keyboard.onKeyboardWillHide().unsubscribe();
  }

  ngOnInit() {
    
  }

  /* #region  barcode scanner */

  async startScanning() {
    const allowed = await this.checkPermission();
    if (allowed) {
      // this.scanActive = true;
      this.onCameraStatusChanged.emit(true);
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        let barcode = result.content;
        // this.scanActive = false;
        this.onCameraStatusChanged.emit(false);
        barcode = this.manipulateBarcodeCheckDigit(barcode);
        await this.onDoneScanning.emit(barcode);
      }
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

  async checkPermission() {
    return new Promise(async (resolve) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        const alert = await this.alertController.create({
          header: 'No permission',
          message: 'Please allow camera access in your setting',
          buttons: [
            {
              text: 'Open Settings',
              handler: () => {
                BarcodeScanner.openAppSettings();
                resolve(false);
              },
            },
            {
              text: 'No',
              role: 'cancel',
            },
          ],
        });
        await alert.present();
      } else {
        resolve(false);
      }
    });
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    // this.scanActive = false;
    this.onCameraStatusChanged.emit(false);
  }

  showButton() {
    this.isButtonVisible = true;
  }

  hideButton() { 
    this.isButtonVisible = false;
  }

  /* #endregion */
}
