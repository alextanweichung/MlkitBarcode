import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from '../../services/common.service';
import { AlertController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Keyboard } from '@capacitor/keyboard';

@Component({
   selector: 'app-general-scan-input',
   templateUrl: './general-scan-input.page.html',
   styleUrls: ['./general-scan-input.page.scss'],
})
export class GeneralScanInputPage implements OnInit, ViewWillEnter, ViewDidEnter {

   @Input() title: string = "Selection";
   @Input() placeholder: string = "Scan or Enter";

   @Output() onScanCompleted = new EventEmitter<any>();

   searchValue: string;
   @ViewChild("scanInput", { static: false }) scanInput: ElementRef;

   constructor(
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      private toastService: ToastService,
      private alertController: AlertController
   ) { }

   ionViewWillEnter(): void {
      this.setFocus();
   }

   ionViewDidEnter(): void {
      this.setFocus();
   }

   ngOnInit() {

   }

   async onKeyDown(e: any, key: string) {
      if (e.keyCode === 13) {
         this.onScanCompleted.emit(key);
         this.searchValue = "";
         e.preventDefault();
         this.setFocus();
      }
   }

   showKeyboard(event) {
      event.preventDefault();
      this.setFocus();
      setTimeout(async () => {
         await Keyboard.show();
      }, 100);
   }

   /* #region focus */

   @Input() scanActive: boolean;
   @Output() onCameraStatusChanged = new EventEmitter<boolean>();
   @Output() onDoneScanning = new EventEmitter<string>();

   scanningMethodChanged() {
      this.setFocus();
   }

   setFocus() {
      setTimeout(() => {
         this.scanInput.nativeElement.focus();
      }, 100);
   }

   /* #endregion */

   /* #region camera scanner */

   async startScanning() {
      const allowed = await this.checkPermission();
      if (allowed) {
         // this.scanActive = true;
         this.onCameraStatusChanged.emit(true);
         const result = await BarcodeScanner.startScan();
         if (result.hasContent) {
            let value = result.content;
            // this.scanActive = false;
            this.onCameraStatusChanged.emit(false);
            await this.onDoneScanning.emit(value);
         }
      }
   }

   async checkPermission() {
      return new Promise(async (resolve) => {
         const status = await BarcodeScanner.checkPermission({ force: true });
         if (status.granted) {
            resolve(true);
         } else if (status.denied) {
            const alert = await this.alertController.create({
               header: "No permission",
               message: "Please allow camera access in your setting",
               buttons: [
                  {
                     text: "Open Settings",
                     handler: () => {
                        BarcodeScanner.openAppSettings();
                        resolve(false);
                     },
                  },
                  {
                     text: "No",
                     role: "cancel",
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

}
