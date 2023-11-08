import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, NavController, ViewWillEnter } from '@ionic/angular';
import { TransferOutLine, TransferOutRoot } from 'src/app/modules/transactions/models/transfer-out';
import { TransferOutService } from 'src/app/modules/transactions/services/transfer-out.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-transfer-out-item',
  templateUrl: './transfer-out-item.page.html',
  styleUrls: ['./transfer-out-item.page.scss'],
})
export class TransferOutItemPage implements OnInit, ViewWillEnter {

  @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage

  constructor(
    public objectService: TransferOutService,
    private configService: ConfigService,
    private commonService: CommonService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private navController: NavController,
    private alertController: AlertController,
  ) { }

  ionViewWillEnter(): void {

  }

  ngOnInit() {

  }

  /* #region camera scanner */

  scanActive: boolean = false;
  onCameraStatusChanged(event) {
    try {
      this.scanActive = event;
      if (this.scanActive) {
        document.body.style.background = "transparent";
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onDoneScanning(event) {
    try {
      if (event) {
        await this.barcodescaninput.validateBarcode(event);
      }
    } catch (e) {
      console.error(e);
    }
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    // this.scanActive = false;
    this.onCameraStatusChanged(false);
  }

  /* #endregion */

  /* #region barcode & check so */

  async onItemAdd(event: TransactionDetail[]) {
    try {
      if (event) {
        event.forEach(async r => {
          let outputData: TransferOutLine = {
            id: 0,
            uuid: uuidv4(),
            transferOutId: this.objectService.objectHeader.transferOutId,
            sequence: 0,
            itemId: r.itemId,
            itemCode: r.itemCode,
            itemSku: r.itemSku,
            itemDesc: r.description,
            xId: r.itemVariationXId,
            xCd: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.code,
            xDesc: this.objectService.itemVariationXMasterList.find(rr => rr.id === r.itemVariationXId)?.description,
            yId: r.itemVariationYId,
            yCd: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.code,
            yDesc: this.objectService.itemVariationYMasterList.find(rr => rr.id === r.itemVariationYId)?.description,
            barcode: r.itemBarcode,
            lineQty: 1,
            qtyRequest: 1,
            isDeleted: false,
            unitPrice: r.itemPricing?.unitPrice,
            unitPriceExTax: r.itemPricing?.unitPrice,
            discountGroupCode: r.itemPricing?.discountGroupCode,
            discountExpression: r.itemPricing?.discountExpression
          }
          await this.commonService.computeDiscTaxAmount(outputData, false, false, false, 2); // todo : use tax??
          this.insertIntoLine(outputData);
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  async qtyInputBlur(event, rowIndex) {
    if (rowIndex === null || rowIndex === undefined) {
      this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
    } else {
      this.objectService.objectDetail[rowIndex].qtyRequest = this.objectService.objectDetail[rowIndex].lineQty;
      await this.commonService.computeDiscTaxAmount(this.objectService.objectDetail[rowIndex], false, false, false, 2);
    }
  }

  async insertIntoLine(event: TransferOutLine) {
    if (event) {
      if (this.objectService.objectDetail !== null && this.objectService.objectDetail.length > 0) {
        if (this.objectService.objectDetail[0].itemSku === event.itemSku) {
          this.objectService.objectDetail[0].lineQty += event.lineQty;
          this.objectService.objectDetail[0].qtyRequest = this.objectService.objectDetail[0].lineQty;
          await this.commonService.computeDiscTaxAmount(this.objectService.objectDetail[0], false, false, false, 2);
        } else {
          this.objectService.objectDetail.unshift(event);
        }
      } else {
        this.objectService.objectDetail.unshift(event);
      }
    }
  }

  async deleteLine(rowIndex: number, event: TransferOutLine) {
    const alert = await this.alertController.create({
      cssClass: "custom-alert",
      header: "Are you sure to delete?",
      buttons: [
        {
          text: "OK",
          role: "confirm",
          cssClass: "danger",
          handler: async () => {
            this.objectService.objectDetail.splice(rowIndex, 1);
          },
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {

          }
        },
      ],
    });
    await alert.present();
  }

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  /* #endregion */

  /* #region  step */

  previousStep() {
    try {
      this.navController.navigateBack("/transactions/transfer-out/transfer-out-add");
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    const alert = await this.alertController.create({
      header: "Are you sure to proceed?",
      cssClass: "custom-action-sheet",
      buttons: [
        {
          text: "Yes",
          role: "confirm",
          cssClass: "success",
          handler: async () => {
            this.saveObject();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {

          }
        },
      ],
    });
    await alert.present();
  }

  saveObject() {
    let object: TransferOutRoot;
    object = this.objectService.objectHeader;
    object.line = this.objectService.objectDetail;
    if (object.line !== null && object.line.length > 0) {
      if (this.objectService.objectHeader.transferOutId > 0) {
        this.objectService.updateObject(object).subscribe(response => {
          if (response.status === 204) {
            this.toastService.presentToast("", "Transfer Out updated", "top", "success", 1000);
            let navigationExtras: NavigationExtras = {
              queryParams: {
                objectId: this.objectService.objectHeader.transferOutId
              }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
          }
        }, error => {
          console.error(error);
        })
      } else {
        this.objectService.insertObject(object).subscribe(response => {
          if (response.status === 201) {
            this.toastService.presentToast("", "Transfer Out created", "top", "success", 1000);
            let objectId = (response.body as TransferOutRoot).transferOutId;
            let navigationExtras: NavigationExtras = {
              queryParams: {
                objectId: objectId
              }
            }
            this.objectService.resetVariables();
            this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
          }
        }, error => {
          console.error(error);
        })
      }
    } else {
      this.toastService.presentToast("", "Unable to insert without line", "top", "warning", 1000);
    }
  }

  /* #endregion */

}
