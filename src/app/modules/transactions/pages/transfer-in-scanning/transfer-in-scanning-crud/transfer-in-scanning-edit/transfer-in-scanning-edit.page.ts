import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, ActionSheetController, AlertController, IonPopover } from '@ionic/angular';
import { TransferInScanningLine, TransferInScanningRoot } from 'src/app/modules/transactions/models/transfer-in-scanning';
import { TransferInScanningService } from 'src/app/modules/transactions/services/transfer-in-scanning.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-transfer-in-scanning-edit',
  templateUrl: './transfer-in-scanning-edit.page.html',
  styleUrls: ['./transfer-in-scanning-edit.page.scss'],
})
export class TransferInScanningEditPage implements OnInit {

  objectId: number;
  object: TransferInScanningRoot;

  constructor(
    public objectService: TransferInScanningService,
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params["objectId"];
      if (this.objectId === null || this.objectId === undefined) {
        this.toastService.presentToast("", "Invalid ObjectId", "top", "danger", 1000);
        this.navController.navigateRoot("/transactions/transfer-in-scanning");
      } else {
        this.loadObject();
      }
    })
  }

  ngOnInit() {
    this.loadModuleControl();
  }

  systemWideEAN13IgnoreCheckDigit: boolean = false;
  moduleControl: ModuleControl[] = [];
  allowDocumentWithEmptyLine: string = "N";
  pickingQtyControl: string = "0";
  systemWideScanningMethod: string;
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
    })
  }

  loadObject() {
    if (this.objectId) {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw error;
      })
    }
  }

  /* #region barcode scanner */

  async validateBarcode(barcode: string) {
    try {
      if (barcode) {
        if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
          let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
          if (found_barcode) {
            let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
            if (found_item_master) {
              let itemExistInLine = this.object.line.find(r => r.itemSku === found_barcode.sku);
              if (itemExistInLine) {
                let outputData: TransferInScanningLine = {
                  id: 0,
                  uuid: uuidv4(),
                  transferInScanningId: 0,
                  interTransferLineId: itemExistInLine.interTransferLineId,
                  interTransferVariationId: itemExistInLine.interTransferVariationId,
                  interTransferId: itemExistInLine.interTransferId,
                  sequence: 0,
                  itemId: itemExistInLine.itemId,
                  itemCode: itemExistInLine.itemCode,
                  itemSku: itemExistInLine.itemSku,
                  itemDesc: itemExistInLine.itemDesc,
                  xId: itemExistInLine.xId,
                  xCd: itemExistInLine.xCd,
                  xDesc: itemExistInLine.xDesc,
                  yId: itemExistInLine.yId,
                  yCd: itemExistInLine.yCd,
                  yDesc: itemExistInLine.yDesc,
                  barcode: itemExistInLine.barcode,
                  lineQty: 1,
                  qtyReceive: null,
                  isDeleted: itemExistInLine.isDeleted
                }
                return outputData;
              } else {
                let outputData: TransferInScanningLine = {
                  id: 0,
                  uuid: uuidv4(),
                  transferInScanningId: 0,
                  interTransferLineId: null,
                  interTransferVariationId: null,
                  interTransferId: null,
                  sequence: 0,
                  itemId: found_item_master.id,
                  itemCode: found_item_master.code,
                  itemSku: found_barcode.sku,
                  itemDesc: found_item_master.itemDesc,
                  xId: found_barcode.xId,
                  xCd: found_barcode.xCd,
                  xDesc: found_barcode.xDesc,
                  yId: found_barcode.yId,
                  yCd: found_barcode.yCd,
                  yDesc: found_barcode.yDesc,
                  barcode: found_barcode.barcode,
                  lineQty: 1,
                  qtyReceive: null,
                  isDeleted: false
                }
                return outputData;                
              }
            } else {
              this.toastService.presentToast("", "Item not found.", "top", "warning", 1000);
            }
          } else {
            this.toastService.presentToast("", "Barcode not found.", "top", "warning", 1000);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async onItemAdd(event: TransactionDetail[]) {
    try {
      if (event) {
        event.forEach(async r => {
          let itemExistInLine = this.object.line.find(rr => rr.itemSku === r.itemSku);
          if (itemExistInLine) {
            let outputData: TransferInScanningLine = {
              id: 0,
              uuid: uuidv4(),
              transferInScanningId: 0,
              interTransferLineId: itemExistInLine.interTransferLineId,
              interTransferVariationId: itemExistInLine.interTransferVariationId,
              interTransferId: itemExistInLine.interTransferId,
              sequence: 0,
              itemId: itemExistInLine.itemId,
              itemCode: itemExistInLine.itemCode,
              itemSku: itemExistInLine.itemSku,
              itemDesc: itemExistInLine.itemDesc,
              xId: itemExistInLine.xId,
              xCd: itemExistInLine.xCd,
              xDesc: itemExistInLine.xDesc,
              yId: itemExistInLine.yId,
              yCd: itemExistInLine.yCd,
              yDesc: itemExistInLine.yDesc,
              barcode: itemExistInLine.barcode,
              lineQty: 1,
              qtyReceive: null,
              isDeleted: itemExistInLine.isDeleted
            }
            this.insertIntoLine(outputData);
          } else {
            let outputData: TransferInScanningLine = {
              id: 0,
              uuid: uuidv4(),
              transferInScanningId: 0,
              interTransferLineId: null,
              interTransferVariationId: null,
              interTransferId: null,
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
              qtyReceive: null,
              isDeleted: false
            }
            this.insertIntoLine(outputData);
          }
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  insertIntoLine(event: TransferInScanningLine) {
    if (event) {
      if (this.object.line.findIndex(r => r.itemSku === event.itemSku) > -1) {
        let index = this.object.line.findIndex(r => r.itemSku === event.itemSku);
        if (this.object.line[index].uuid === null) {
          this.object.line[index].uuid = event.uuid;
        }
        this.object.line[index].lineQty = (this.object.line[index].lineQty??0) + 1;
      } else {
        this.object.line.unshift(event);
      }
    }
  }

  async deleteLine(rowIndex: number, event: TransferInScanningLine) {
    const alert = await this.alertController.create({
      cssClass: "custom-alert",
      header: "Are you sure to delete?",
      buttons: [
        {
          text: "OK",
          role: "confirm",
          cssClass: "danger",
          handler: async () => {
            this.object.line.splice(rowIndex, 1);
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
        let itemFound = await this.validateBarcode(event);
        if (itemFound) {
          this.insertIntoLine(itemFound);
        } else {
          this.toastService.presentToast("", "Item not found", "top", "warning", 1000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  qtyOnBlur(rowIndex: number, qty: any) {
    if (qty && Number(qty) > 0) {
      // if (qty > this.object.line[rowIndex].lineQty) {
      //   this.object.line[rowIndex].qtyReceive = this.object.line[rowIndex].lineQty;
      //   this.toastService.presentToast("", "Received Qty cannot exceed Line Qty", "top", "warning", 1000);
      // } else {
        this.object.line[rowIndex].lineQty = Number(qty);
      // }
    }
  }

  /* #endregion */

  /* #region variance modal */

  varianceModel: boolean = false;
  showVariance() {
    this.varianceModel = true;
  }
  hideModal() {
    this.varianceModel = false;
  }

  /* #endregion */

  /* #region for web testing */
  itemSearchValue: string;
  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.objectService.validateBarcode(this.itemSearchValue).subscribe(async response => {
        this.itemSearchValue = null;
        if (response) {
          let itemExistInLine = this.object.line.find(rr => rr.itemSku === response.itemSku);
          if (itemExistInLine) {
            let outputData: TransferInScanningLine = {
              id: 0,
              uuid: uuidv4(),
              transferInScanningId: 0,
              interTransferLineId: itemExistInLine.interTransferLineId,
              interTransferVariationId: itemExistInLine.interTransferVariationId,
              interTransferId: itemExistInLine.interTransferId,
              sequence: 0,
              itemId: itemExistInLine.itemId,
              itemCode: itemExistInLine.itemCode,
              itemSku: itemExistInLine.itemSku,
              itemDesc: itemExistInLine.itemDesc,
              xId: itemExistInLine.xId,
              xCd: itemExistInLine.xCd,
              xDesc: itemExistInLine.xDesc,
              yId: itemExistInLine.yId,
              yCd: itemExistInLine.yCd,
              yDesc: itemExistInLine.yDesc,
              barcode: itemExistInLine.barcode,
              lineQty: 1,
              qtyReceive: null,
              isDeleted: itemExistInLine.isDeleted
            }
            this.insertIntoLine(outputData);
          } else {
            let outputData: TransferInScanningLine = {
              id: 0,
              uuid: uuidv4(),
              transferInScanningId: 0,
              interTransferLineId: null,
              interTransferVariationId: null,
              interTransferId: null,
              sequence: 0,
              itemId: response.itemId,
              itemCode: response.itemCode,
              itemSku: response.itemSku,
              itemDesc: response.description,
              xId: response.itemVariationLineXId,
              xCd: this.objectService.itemVariationXMasterList.find(rr => rr.id === response.itemVariationLineXId)?.code,
              xDesc: this.objectService.itemVariationXMasterList.find(rr => rr.id === response.itemVariationLineXId)?.description,
              yId: response.itemVariationLineYId,
              yCd: this.objectService.itemVariationYMasterList.find(rr => rr.id === response.itemVariationLineYId)?.code,
              yDesc: this.objectService.itemVariationYMasterList.find(rr => rr.id === response.itemVariationLineYId)?.description,
              barcode: response.itemBarcode,
              lineQty: 1,
              qtyReceive: null,
              isDeleted: false
            }
            this.insertIntoLine(outputData);
          }
        }
      }, error => {
        console.error(error);
      })
      event.preventDefault();
    }
  }

  /* #endregion */

  /* #region steps */

  async cancelUpdate() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Are you sure to cancel?",
        subHeader: "Changes made will be discard.",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Yes",
            role: "confirm",
          },
          {
            text: "No",
            role: "cancel",
          }]
      });
      await actionSheet.present();

      const { role } = await actionSheet.onWillDismiss();

      if (role === "confirm") {
        this.objectService.resetVariables();
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectId
          }
        }
        this.navController.navigateRoot("/transactions/transfer-in-scanning/transfer-in-scanning-detail", navigationExtras);
      }
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
            this.updateObject();
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

  updateObject() {
    this.objectService.updateObject(this.object).subscribe(response => {
      if (response.status === 204) {
        this.toastService.presentToast("", "Transfer In Scanning updated", "top", "success", 1000);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.object.transferInScanningId
          }
        }
        this.objectService.resetVariables();
        this.navController.navigateRoot("/transactions/transfer-in-scanning/transfer-in-scanning-detail", navigationExtras);
      }
    }, error => {
      console.error(error);
    })
  }

  /* #endregion */

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

}
