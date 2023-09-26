import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, ViewWillEnter } from '@ionic/angular';
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
export class ConsignmentCountHeaderPage implements OnInit, ViewWillEnter {

  objectForm: FormGroup;
  objectId: number = 0;
  objectRoot: ConsignmentCountRoot;

  constructor(
    public objectService: ConsignmentCountService,
    private configService: ConfigService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
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
      printCount: [null]
    });
  }

  ionViewWillEnter(): void {
  }

  ngOnInit() {
    this.bindLocationList();
    if (this.objectId) {
      this.loadObject();
    }
  }

  loadObject() {
    if (this.objectId) {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.objectRoot = response;
        this.objectRoot.header = this.commonService.convertObjectAllDateType(this.objectRoot.header);
        this.objectForm.patchValue(this.objectRoot.header);
        this.objectService.setHeader(this.objectRoot.header);

        let td: TransactionDetail[] = [];
        this.objectRoot.details.forEach(async r => {
          let found = this.objectRoot.barcodeTag.find(rr => rr.itemId === r.itemId);
          if (found) {
            r.itemCode = found.itemCode;
            r.description = found.description;
          }
          td.push(r);
        })
        this.objectService.setLines(td);
      }, error => {
        console.error(error);
      })
    }
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

  onLocationSelected(event) {
    if (event) {
      this.objectForm.patchValue({ locationId: event.id });
      this.objectService.removeLines();
    }
  }

  /* #region steps */

  async cancelInsert() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Are you sure to cancel?',
        subHeader: 'Changes made will be discard.',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Yes',
            role: 'confirm',
          },
          {
            text: 'No',
            role: 'cancel',
          }]
      });
      await actionSheet.present();
  
      const { role } = await actionSheet.onWillDismiss();
  
      if (role === 'confirm') {
        this.objectService.resetVariables();
        if (this.objectId > 0) {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectId
            }
          }
          this.navController.navigateRoot('/transactions/consignment-count/consignment-count-detail', navigationExtras);
        }
        else {
          this.navController.navigateBack('/transactions/consignment-count');
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  nextStep() {
    this.objectService.setHeader(this.objectForm.getRawValue());
    this.navController.navigateForward('/transactions/consignment-count/consignment-count-item');
  }

  /* #endregion */

}
