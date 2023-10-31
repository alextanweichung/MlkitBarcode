import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { AlertController, IonPopover, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ConsignmentCountDetail, ConsignmentCountRoot } from 'src/app/modules/transactions/models/consignment-count';
import { ConsignmentSalesRoot } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentCountService } from 'src/app/modules/transactions/services/consignment-count.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-consignment-count-item',
  templateUrl: './consignment-count-item.page.html',
  styleUrls: ['./consignment-count-item.page.scss'],
  providers: [BarcodeScanInputService, { provide: "apiObject", useValue: "MobileConsignmentCount" }]
})
export class ConsignmentCountItemPage implements OnInit, ViewWillEnter, ViewDidEnter {

  submit_attempt: boolean = false;
  max: number = 10;

  @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;

  constructor(
    public objectService: ConsignmentCountService,
    private configService: ConfigService,
    private authService: AuthService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private navController: NavController
  ) { }

  async ionViewWillEnter(): Promise<void> {

  }

  async ionViewDidEnter(): Promise<void> {
    try {
      await this.barcodescaninput.setFocus();
      if (this.objectService.objectHeader === null || this.objectService.objectHeader === undefined) {
        this.toastService.presentToast("System Error", "Please contact administrator", "top", "danger", 1000);
        this.navController.navigateRoot("/transactions/consignment-count/consignment-count-header");
      }
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    this.loadModuleControl();
  }

  moduleControl: ModuleControl[] = [];
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  loadModuleControl() {
    try {
      this.authService.moduleControlConfig$.subscribe(obj => {
        this.moduleControl = obj;
        let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
        if (ignoreCheckdigit != undefined) {
          this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
        }
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #region item line */

  onItemAdd(event: TransactionDetail[]) {
    if (event && event.length > 0) {
      event.forEach(r => {
        this.addItemToLine(r);
      })
    }
  }

  async addItemToLine(trxLine: TransactionDetail) {
    try {
      if (this.objectService.objectDetail.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
        this.objectService.objectDetail.find(r => r.itemSku === trxLine.itemSku).qtyRequest += 1;
        let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      } else {
        let newLine: ConsignmentCountDetail = {
          consignmentCountLineId: 0,
          consignmentCountId: this.objectService.objectHeader.consignmentCountId,
          locationId: this.objectService.objectHeader.locationId,
          itemId: trxLine.itemId,
          itemVariationXId: trxLine.itemVariationXId,
          itemVariationYId: trxLine.itemVariationYId,
          itemSku: trxLine.itemSku,
          itemBarcodeTagId: trxLine.itemBarcodeTagId,
          itemBarcode: trxLine.itemBarcode,
          qtyRequest: 1,
          sequence: 0,
          // for local use
          itemCode: trxLine.itemCode,
          itemDescription: trxLine.description,
          // testing performance
          guid: uuidv4()
        }
        this.objectService.objectDetail.forEach(r => { r.sequence += 1 });
        await this.objectService.objectDetail.unshift(newLine);
        let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
        this.max = 10;
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  manual amend qty */

  async decreaseQty(line: ConsignmentCountDetail, index: number) {
    try {
      if (line.qtyRequest - 1 < 0) {
        line.qtyRequest = 0;
        let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      } else {
        line.qtyRequest--;
        let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
        await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
      }
      if (line.qtyRequest === 0) {
        await this.deleteLine(index);
      }
    } catch (e) {
      console.error(e);
    }
  }

  eventHandler(keyCode, line) {
    if (keyCode === 13) {
      if (Capacitor.getPlatform() !== "web") {
        Keyboard.hide();
      }
    }
  }

  async increaseQty(line: ConsignmentCountDetail) {
    line.qtyRequest += 1;
    let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
    await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
  }

  async deleteLine(index) {
    try {
      if (this.objectService.objectDetail[index]) {
        const alert = await this.alertController.create({
          cssClass: "custom-alert",
          header: "Delete this item?",
          message: "This action cannot be undone.",
          buttons: [
            {
              text: "Delete item",
              cssClass: "danger",
              handler: async () => {
                this.objectService.objectDetail.splice(index, 1);
                this.toastService.presentToast("", "Line deleted", "top", "success", 1000);
                let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
              }
            },
            {
              text: "Cancel",
              role: "cancel",
              cssClass: "cancel",
              handler: async () => {
                this.objectService.objectDetail[index].qtyRequest === 0 ? (this.objectService.objectDetail[index].qtyRequest += 1) : 1;
                let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
                await this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
              }
            }
          ]
        });
        await alert.present();
      } else {
        this.toastService.presentToast("System Error", "Invalid Index", "top", "danger", 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  barcode scanner */

  scanActive: boolean = false;
  onCameraStatusChanged(event) {
    this.scanActive = event;
    if (this.scanActive) {
      document.body.style.background = "transparent";
    }
  }

  async onDoneScanning(barcode: string) {
    if (barcode) {
      await this.barcodescaninput.validateBarcode(barcode);
    }
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    // this.scanActive = false;
    this.onCameraStatusChanged(false);
  }

  /* #endregion */

  /* #region steps */

  previousStep() {
    this.navController.navigateBack("/transactions/consignment-count/consignment-count-header");
  }

  async nextStep() {
    try {
      this.submit_attempt = true;
      const alert = await this.alertController.create({
        cssClass: "custom-alert",
        header: "Are you sure to proceed?",
        buttons: [
          {
            text: "Confirm",
            cssClass: "success",
            handler: async () => {
              if (this.objectService.objectHeader.consignmentCountId > 0) {
                this.updateObject();
              } else {
                this.insertObject();
              }
            }
          },
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "cancel",
            handler: async () => {
              this.submit_attempt = false;
            }
          }
        ]
      });
      await alert.present();
    } catch (e) {
      this.submit_attempt = false;
      console.error(e);
    } finally {
      this.submit_attempt = false;
    }
  }

  async insertObject() {
    try {
      await this.loadingService.showLoading();
      this.objectService.insertObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
        if (response.status === 201) {
          this.submit_attempt = false;
          let object = response.body as ConsignmentCountRoot;
          this.toastService.presentToast("", "Consignment Count added", "top", "success", 1000);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: object.header.consignmentCountId
            }
          }
          this.objectService.resetVariables();
          await this.loadingService.dismissLoading();
          this.navController.navigateRoot("/transactions/consignment-count/consignment-count-detail", navigationExtras);
        }
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      this.submit_attempt = false;
      await this.loadingService.dismissLoading();
      console.error(e);
    } finally {
      this.submit_attempt = false;
      await this.loadingService.dismissLoading();
    }
  }

  async updateObject() {
    try {
      await this.loadingService.showLoading();
      this.objectService.updateObject({ header: this.objectService.objectHeader, details: this.objectService.objectDetail }).subscribe(async response => {
        if (response.status === 201) {
          this.submit_attempt = false;
          let object = response.body as ConsignmentCountRoot;
          this.toastService.presentToast("", "Consignment Count updated", "top", "success", 1000);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: object.header.consignmentCountId
            }
          }
          this.objectService.resetVariables();
          await this.loadingService.dismissLoading();
          this.navController.navigateRoot("/transactions/consignment-count/consignment-count-detail", navigationExtras);
        }
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      this.submit_attempt = false;
      await this.loadingService.dismissLoading();
      console.error(e);
    } finally {
      this.submit_attempt = false;
      await this.loadingService.dismissLoading();
    }
  }

  /* #endregion */

  identify(index, line) {
    return line.guid;
  }

  async loadALl() {
    this.max += (this.objectService.objectDetail.length??0)
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  sendForDebug() {
    let trxDto: ConsignmentCountRoot = {
      header: this.objectService.objectHeader,
      details: this.objectService.objectDetail
    }
    let jsonObjectString = JSON.stringify(trxDto);
    console.log("🚀 ~ file: consignment-count-item.page.ts:364 ~ ConsignmentCountItemPage ~ sendForDebug ~ trxDto:", JSON.stringify(trxDto))
    let debugObject: JsonDebug = {
      jsonDebugId: 0,
      jsonData: jsonObjectString
    };
    console.log("🚀 ~ file: consignment-count-item.page.ts:369 ~ ConsignmentCountItemPage ~ sendForDebug ~ debugObject:", JSON.stringify(debugObject))

    this.objectService.sendDebug(debugObject).subscribe(response => {
      console.log("🚀 ~ file: consignment-count-item.page.ts:372 ~ ConsignmentCountItemPage ~ this.objectService.sendDebug ~ response:", JSON.stringify(response))
      if (response.status == 200) {
        this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
      }
    }, error => {
      this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
      console.log(error);
    });
  }

}
