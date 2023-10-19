import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
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
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

@Component({
  selector: 'app-transfer-out-add',
  templateUrl: './transfer-out-add.page.html',
  styleUrls: ['./transfer-out-add.page.scss'],
})
export class TransferOutAddPage implements OnInit, ViewWillEnter, ViewWillLeave {

  objectForm: UntypedFormGroup;
  objectId: number = null;
  
  systemWideEAN13IgnoreCheckDigit: boolean = false;

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
    private route: ActivatedRoute,
    private platform: Platform,
  ) {
    this.setFormattedDateString();
    this.newObjectForm();

    this.route.queryParams.subscribe(params => {
      this.objectId = params["objectId"];
      if (this.objectId) {
        this.loadObject();
      }
    })

  }
  
  ionViewWillEnter(): void {
    
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

  loadObject() {
    if (this.objectId) {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        let object = response;
        this.commonService.convertObjectAllDateType(object);
        this.objectForm.patchValue(object);
        this.objectService.setHeader(object);
        this.objectService.setLine(object.line);
        this.dateValue = format(new Date(object.trxDate), "yyyy-MM-dd") + "T08:00:00.000Z";
        this.setFormattedDateString();
      }, error => {
        console.error(error);
      })
    }
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
        if (this.objectService?.header?.transferOutId > 0) {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectService.header.transferOutId
            } 
          }
          this.navController.navigateRoot("/transactions/transfer-out/transfer-out-detail", navigationExtras);
        } else {
          this.objectService.resetVariables();
          this.navController.navigateBack("/transactions/transfer-out");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    this.objectService.setHeader(this.objectForm.getRawValue());
    this.navController.navigateForward("/transactions/transfer-out/transfer-out-item");
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
