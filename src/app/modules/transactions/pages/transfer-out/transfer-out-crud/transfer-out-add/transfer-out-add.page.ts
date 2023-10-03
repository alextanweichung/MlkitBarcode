import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { NavController, ActionSheetController, AlertController, ViewWillEnter, ViewWillLeave, Platform, IonDatetime } from '@ionic/angular';
import { TransferOutLine, TransferOutRoot } from 'src/app/modules/transactions/models/transfer-out';
import { TransferOutService } from 'src/app/modules/transactions/services/transfer-out.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';
import { v4 as uuidv4 } from 'uuid';
import { Keyboard } from '@capacitor/keyboard';
import { format, parseISO } from 'date-fns';

@Component({
  selector: 'app-transfer-out-add',
  templateUrl: './transfer-out-add.page.html',
  styleUrls: ['./transfer-out-add.page.scss'],
})
export class TransferOutAddPage implements OnInit, ViewWillEnter, ViewWillLeave {

  objectForm: UntypedFormGroup;
  objectLine: TransferOutLine[] = [];
  
  systemWideEAN13IgnoreCheckDigit: boolean = false;

  isKeyboardShown: boolean = false;

  constructor(
    public objectService: TransferOutService,
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastService: ToastService,
    private formBuilder: UntypedFormBuilder,
    private platform: Platform,
  ) {
    this.setFormattedDateString();
    this.newObjectForm();
  }
  
  ionViewWillEnter(): void {
    // Keyboard.addListener('keyboardWillShow', info => {
    //   setTimeout(_ => {
    //     this.isKeyboardShown = true;
    //   }, 100);
    //   console.log('keyboard will show with height:', info.keyboardHeight);
    // });
    // Keyboard.addListener('keyboardWillHide', () => {
    //   setTimeout(_ => {
    //     this.isKeyboardShown = false;
    //   }, 100);
    //   console.log('keyboard will hide');
    // });
  }

  ionViewWillLeave(): void {
    
  }

  newObjectForm() {
    let primaryLocationIndex = this.objectService.locationList.findIndex(r => r.isPrimary);
    this.objectForm = this.formBuilder.group({
      transferOutId: [0],
      transferOutNum: [null],
      trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
      typeCode: ["C"],
      locationId: [(primaryLocationIndex > -1 ? this.objectService.locationList[primaryLocationIndex].locationId : null), [Validators.required]],
      toLocationId: [null, [Validators.required]],
      deactivated: [false],
      isCompleted: [false],
      sourceType: ["M"],
      interTransferNum: [null],
      totalCarton: [null],
      remark: [null],
      workFlowTransactionId: [null],
      grnNum: [null]
    })
  }
  
  ngOnInit() {
    this.loadModuleControl();
    this.bindLocationList();
  }

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

  consignmentLocationSearchDropdownList: SearchDropdownList[] = [];
  bindLocationList() {
    this.consignmentLocationSearchDropdownList = [];
    try {
      this.objectService.locationList.forEach(r => {
        this.consignmentLocationSearchDropdownList.push({
          id: r.locationId,
          code: r.locationCode,
          description: r.locationDescription
        })
      })
    } catch (e) {
      console.error(e);
    }
  }

  onLocationChanged(event: any) {
    if (event) {
      this.objectForm.patchValue({ locationId: event.id });
    }
  }

  onToLocationChanged(event: any) {
    if (event) {
      this.objectForm.patchValue({ toLocationId: event.id });
    }
  }

  /* #region barcode & check so */

  async validateBarcode(barcode: string) {
    try {
      if (barcode) {
        if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
          let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
          if (found_barcode) {
            let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
            let outputData: TransferOutLine = {
              id: 0,
              uuid: uuidv4(),
              transferOutId: this.objectForm.controls.transferOutId.value,
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
              isDeleted: false
            }
            return outputData;
          } else {
            this.toastService.presentToast("", "Barcode not found.", "top", "danger", 1000);
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
          let outputData: TransferOutLine = {
            id: 0,
            uuid: uuidv4(),
            transferOutId: this.objectForm.controls.transferOutId.value,
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
            isDeleted: false
          }
          this.insertIntoLine(outputData);
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

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

  insertIntoLine(event: TransferOutLine) {
    if (event) {
      if (this.objectLine !== null && this.objectLine.length > 0) {
        if (this.objectLine[0].itemSku === event.itemSku) {
          this.objectLine[0].lineQty += event.lineQty;
        } else {
          this.objectLine.unshift(event);          
        }
      } else {
        this.objectLine.unshift(event);
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
            this.objectLine.splice(rowIndex, 1);
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

  /* #region steps */

  async cancelInsert() {
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
        this.navController.navigateBack("/transactions/transfer-out");
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
            this.insertObject();
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

  insertObject() {
    let insertObject: TransferOutRoot;
    insertObject = this.objectForm.getRawValue();
    insertObject.line = this.objectLine;
    if (insertObject.line !== null && insertObject.line.length > 0) {
      this.objectService.insertObject(insertObject).subscribe(response => {
        if (response.status === 201) {
          this.toastService.presentToast("", "Stock Reorder created", "top", "success", 1000);
          let objectId = (response.body as TransferOutRoot).transferOutId;
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: objectId
            }
          }
          this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
        }
      }, error => {
        console.error(error);
      })
    } else {
      this.toastService.presentToast("", "Unable to insert without line", "top", "warning", 1000);
    }
  }

  /* #endregion */

  /* #region  misc */

  highlight(event) {
    event.getInputElement().then(r => {
      r.select();
    })
  }

  /* #endregion */

  /* #region for web testing */

  itemSearchValue: string;
  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.objectService.validateBarcode(this.itemSearchValue).subscribe(async response => {
        this.itemSearchValue = null;
        if (response) {
          let outputData: TransferOutLine = {
            id: 0,
            uuid: uuidv4(),
            transferOutId: this.objectForm.controls.transferOutId.value,
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
            isDeleted: false
          }
          this.insertIntoLine(outputData);
        }
      }, error => {
        console.error(error);
      })
      event.preventDefault();
    }
  }

  /* #endregion */

  /* #region calendar handle here */

  formattedDateString: string = "";
  dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
  maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
  @ViewChild("datetime") datetime: IonDatetime
  setFormattedDateString() {
    this.formattedDateString = format(parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`), "MMM d, yyyy");
  }

  onTrxDateSelected(value: any) {
    this.dateValue = format(new Date(value), 'yyyy-MM-dd') + "T08:00:00.000Z";
    this.setFormattedDateString();
    this.objectForm.patchValue({ trxDate: parseISO(format(new Date(this.dateValue), 'yyyy-MM-dd') + `T00:00:00.000Z`) });
  }

  dateDismiss() {
    this.datetime.cancel(true);
  }

  dateSelect() {
    this.datetime.confirm(true);
  }

  /* #endregion */

}