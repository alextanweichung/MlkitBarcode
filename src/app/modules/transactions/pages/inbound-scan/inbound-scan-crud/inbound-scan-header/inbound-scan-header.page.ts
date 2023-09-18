import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Keyboard } from '@capacitor/keyboard';
import { ActionSheetController, IonSegment, NavController } from '@ionic/angular';
import { InboundScanDocRoot, InboundScanRoot } from 'src/app/modules/transactions/models/inbound-scan';
import { InboundScanService } from 'src/app/modules/transactions/services/inbound-scan.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-inbound-scan-header',
  templateUrl: './inbound-scan-header.page.html',
  styleUrls: ['./inbound-scan-header.page.scss'],
})
export class InboundScanHeaderPage implements OnInit {

  objectForm: FormGroup;
  objectId: number = 0;
  objectRoot: InboundScanRoot;

  constructor(
    public objectService: InboundScanService,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params["objectId"]??0;
    })
    this.newObjectForm();
  }

  ngOnInit() {
    if (this.objectId) {
      this.loadObject();
    }
  }

  /* #region load object if id > 0 (edit mode) */

  loadObject() {
    if (this.objectId) {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.objectRoot = response;
        this.objectRoot.header = this.commonService.convertObjectAllDateType(this.objectRoot.header);
        this.objectForm.patchValue(this.objectRoot.header);
        this.objectService.setObject(this.objectRoot);
      }, error => {
        console.error(error);
      })
    }
  }

  /* #endregion */

  showKeyboard(event) {
    event.preventDefault();
    this.barcodeInput.nativeElement.focus();
    setTimeout(async () => {
      await Keyboard.show();
    }, 100);
  }

  @ViewChild("segment", { static: false }) segment: IonSegment;
  isWithDoc: string = "true";
  async isWithDocChanged(event) {
    try {
      if (event.detail.value === "true") {
        this.objectForm.patchValue({ isWithDoc: true });
      } else {
        this.objectForm.patchValue({ isWithDoc: false });
      }
      //this.objectService.multiPickingObject.pickingCarton = []; // clear picked when setting changed
    } catch (e) {
      console.error(e);
    }
  }

  /* #region scanner input */

  docSearchValue: string;
  handleDocSearchKeyDown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.barcodeInput.nativeElement.focus();
      this.validateDoc(this.docSearchValue);
    }
  }

  /* #endregion */

  /* #region validate doc */

  validateDoc(input: string) {
    if (input && input.length > 0) {
      this.docSearchValue = null;
      if (this.objectForm.controls.docNum.value !== null && (this.objectForm.controls.docNum.value as string).toUpperCase() === input.toUpperCase()) {
        this.toastService.presentToast("", "Doc already selected.", "top", "success", 1000);
      } else {
        this.objectService.getDoc(input).subscribe(response => {
          let doc = response;
          if (doc === null || doc === undefined || doc.length === 0) {
            this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
            return;
          }
          if (doc && doc.length === 1) {
            if (this.objectForm.controls.docId.value !== null) {
              this.changeDocConfirmation(doc[0]);
            } else {
              this.patchDoc(doc[0]);
            }
          }
          if (doc && doc.length > 1) {

          }
        }, error => {
          console.error(error);
        });
      }
    } else {
      this.toastService.presentToast("", "Doc not found.", "top", "warning", 1000);
    }
  }

  async changeDocConfirmation(doc: InboundScanDocRoot) {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Are you sure change Doc?",
        subHeader: "This action cannot be undo.",
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
        this.patchDoc(doc);
      }
    } catch (e) {
      console.error(e);
    }
  }

  selectedDoc: InboundScanDocRoot;
  patchDoc(doc: InboundScanDocRoot) {
    if (doc.header.customerId !== null) {
      this.objectForm.patchValue({ fromLocationId: doc.header.fromLocationId });
      this.objectForm.patchValue({ toLocationId: doc.header.toLocationId });
      this.objectForm.patchValue({ isWithDoc: true });
      this.objectForm.patchValue({ docType: "IT" });
      this.objectForm.patchValue({ docId: doc.header.interTransferId });
      this.objectForm.patchValue({ docNum: doc.header.interTransferNum });
      this.objectForm.patchValue({ fromCustomerId: doc.header.customerId });
      this.selectedDoc = doc;
      this.objectService.setDoc(this.selectedDoc);
    } else {
      this.toastService.presentToast("", "From Customer not available.", "top", "warning", 1000);
    }
  }

  /* #endregion */

  /* #region form */

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      inboundScanId: [0],
      inboundScanNum: [null],
      trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
      fromCustomerId: [null],
      fromLocationId: [null],
      toLocationId: [null],
      typeCode: [null],
      childId: [null],
      childNum: [null],
      childDocType: [null],
      warehouseAgentId: [JSON.parse(localStorage.getItem("loginUser"))?.warehouseAgentId],
      inboundScanUDField1: [null],
      inboundScanUDField2: [null],
      inboundScanUDField3: [null],
      inboundScanUDOption1: [null],
      inboundScanUDOption2: [null],
      inboundScanUDOption3: [null],
      masterUDGroup1: [null],
      masterUDGroup2: [null],
      masterUDGroup3: [null],
      sourceType: ["M"],
      businessModelType: [null],
      isWithDoc: [null],
      docType: [null],
      docId: [null],
      docNum: [null],
      workFlowTransactionId: [null],
      deactivated: [null],
      remark: [null]
    });
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

  @ViewChild("barcodeInput", { static: false }) barcodeInput: ElementRef;
  onDoneScanning(event) {
    try {
      if (event) {
        this.barcodeInput.nativeElement.focus();
        this.validateDoc(event);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region detail modal */

  async showDetail() {
    if (this.objectId === 0) {
      this.objectService.setObject({ header: this.objectForm.getRawValue(), details: [] });
    }
    this.navController.navigateForward("/transactions/inbound-scan/inbound-scan-item");
  }

  /* #endregion */

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
        this.navController.navigateBack("/transactions/inbound-scan");
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
