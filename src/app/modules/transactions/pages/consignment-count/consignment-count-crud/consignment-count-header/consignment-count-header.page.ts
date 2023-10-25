import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { ConsignmentCountRoot } from 'src/app/modules/transactions/models/consignment-count';
import { ConsignmentCountService } from 'src/app/modules/transactions/services/consignment-count.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-consignment-count-header',
  templateUrl: './consignment-count-header.page.html',
  styleUrls: ['./consignment-count-header.page.scss'],
})
export class ConsignmentCountHeaderPage implements OnInit, ViewWillEnter, ViewDidEnter {

  objectForm: FormGroup;
  objectRoot: ConsignmentCountRoot;

  constructor(
    public objectService: ConsignmentCountService,
    private configService: ConfigService,
    private commonService: CommonService,
    private navController: NavController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {
    this.newObjectForm();
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      consignmentCountId: [0],
      consignmentCountNum: [null],
      description: [null],
      trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
      trxDateTime: [null],
      locationId: [this.configService.selected_consignment_location ?? 0, [Validators.required]],
      consignmentCountUDField1: [null],
      consignmentCountUDField2: [null],
      consignmentCountUDField3: [null],
      consignmentCountUDOption1: [null],
      consignmentCountUDOption2: [null],
      consignmentCountUDOption3: [null],
      remark: [null],
      printCount: [null],
      rack: [null],
      zone: [null]
    });
  }

  ionViewWillEnter(): void {
    this.bindLocationList();
  }

  ionViewDidEnter(): void {
    // this.route.queryParams.subscribe(params => {
    //   this.objectId = params["objectId"];
    //   if (this.objectId) {
    //     this.loadObject();
    //   }
    // })
    if (this.objectService.objectHeader !== null || this.objectService.objectHeader !== undefined) {
      this.objectForm.patchValue(this.objectService.objectHeader);
    }
  }

  ngOnInit() {

  }

  // loadObject() {
  //   if (this.objectId) {
  //     this.objectService.getObjectById(this.objectId).subscribe(response => {
  //       this.objectRoot = response;
  //       this.objectRoot.header = this.commonService.convertObjectAllDateType(this.objectRoot.header);
  //       this.objectForm.patchValue(this.objectRoot.header);
  //       this.objectService.setHeader(this.objectRoot.header);        
  //       let td: TransactionDetail[] = [];
  //       this.objectRoot.details.forEach(async r => {
  //         let found = this.objectRoot.barcodeTag.find(rr => rr.itemId === r.itemId);
  //         if (found) {
  //           r.itemCode = found.itemCode;
  //           r.description = found.description;
  //         }
  //         td.push(r);
  //       })
  //       this.objectService.setLines(td);
  //       let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
  //       this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
  //     }, error => {
  //       console.error(error);
  //     })
  //   }
  // }

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

  async onLocationSelected(event) {
    if (event) {
      const alert = await this.alertController.create({
        cssClass: "custom-alert",
        header: "Are you sure to proceed?",
        subHeader: "Changing Location will remove inserted lines",
        buttons: [
          {
            text: "Confirm",
            cssClass: "success",
            handler: async () => {      
              this.objectForm.patchValue({ locationId: event.id });
              this.objectService.removeLines();
            }
          },
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "cancel",
            handler: async () => {

            }
          }
        ]
      });
      await alert.present();
    }
  }

  /* #region steps */

  async cancelInsert() {
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
      if (this.objectService.objectHeader && this.objectService.objectHeader.consignmentCountId > 0) {
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectService.objectHeader.consignmentCountId
          }
        }
        this.objectService.resetVariables();
        this.navController.navigateRoot("/transactions/consignment-count/consignment-count-detail", navigationExtras);
      }
      else {
        this.objectService.resetVariables();
        this.navController.navigateRoot("/transactions/consignment-count");
      }
    }
  }

  nextStep() {
    this.objectService.setHeader(this.objectForm.getRawValue());
    let data: ConsignmentCountRoot = { header: this.objectService.objectHeader, details: this.objectService.objectDetail };
    this.configService.saveToLocaLStorage(this.objectService.trxKey, data);
    this.navController.navigateForward("/transactions/consignment-count/consignment-count-item");
  }

  /* #endregion */

}
