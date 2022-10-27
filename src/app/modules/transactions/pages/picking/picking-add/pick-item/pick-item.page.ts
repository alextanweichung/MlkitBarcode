import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { PickingSalesOrderRoot } from 'src/app/modules/transactions/models/picking-sales-order';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-item',
  templateUrl: './pick-item.page.html',
  styleUrls: ['./pick-item.page.scss'],
})
export class PickItemPage implements OnInit {

  pickingSalesOrder: PickingSalesOrderRoot;

  moduleControl: ModuleControl[] = [];

  loadImage: boolean = true;

  constructor(
    private authService: AuthService,
    private pickingService: PickingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.pickingSalesOrder = this.pickingService.selectedSalesOrder;
    console.log("🚀 ~ file: item.page.ts ~ line 32 ~ ItemPage ~ ngOnInit ~ this.pickingSalesOrder", this.pickingSalesOrder)
    if (!this.pickingSalesOrder || this.pickingSalesOrder === undefined) {
      this.toastService.presentToast('Something went wrong', '', 'top', 'danger', 1500);
      this.navController.navigateBack('/transactions/picking/picking-sales-order');
    }
    this.loadModuleControl();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let loadImage = this.moduleControl.find(r => r.ctrlName === "LoadImage")?.ctrlValue;
      if (loadImage) {
        this.loadImage = loadImage === '1' ? true : false;
      }
    }, error => {
      console.log(error);
    })
  }

  previousStep() {
    this.navController.navigateBack('/transactions/picking/picking-sales-order');
  }

  /* #region  barcode scanner */

  async startScanner() {
    const allowed = await this.checkPermission();
    if (allowed) {
      // this.scanActive = true;
      // document.body.style.background = "transparent";
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        console.log("🚀 ~ file: pick-item.page.ts ~ line 68 ~ PickItemPage ~ startScanner ~ result.content", result.content)        
        // this.itemBarcode = result.content;
        // this.scanActive = false;
        // this.addItem(this.itemBarcode);
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
              text: "No",
              role: "cancel"
            },
            {
              text: "Open Settings",
              handler: () => {
                BarcodeScanner.openAppSettings();
                resolve(false);
              }
            }
          ]
        })
        await alert.present();
      } else {
        resolve(false);
      }
    });
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    // this.scanActive = false;
  }

  /* #endregion */

}
