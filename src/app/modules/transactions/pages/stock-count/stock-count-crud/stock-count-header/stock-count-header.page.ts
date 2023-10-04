import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, IonDatetime, NavController, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { InventoryCountBatchList, StockCountRoot } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { SearchDropdownPage } from 'src/app/shared/pages/search-dropdown/search-dropdown.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-stock-count-header',
  templateUrl: './stock-count-header.page.html',
  styleUrls: ['./stock-count-header.page.scss'],
})
export class StockCountHeaderPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: StockCountRoot;

  objectForm: FormGroup;

  constructor(
    public objectService: StockCountService,
    private commonService: CommonService,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.setFormattedDateString();
    this.newObjectForm();
    this.route.queryParams.subscribe(params => {
      this.objectId = params["objectId"];
    })
  }

  ionViewWillEnter(): void {
    if (this.objectService.objectHeader !== null && this.objectService.objectHeader?.inventoryCountId > 0) {
      this.objectId = this.objectService.objectHeader.inventoryCountId;
      this.object = {
        header: JSON.parse(JSON.stringify(this.objectService.objectHeader)),
        details: JSON.parse(JSON.stringify(this.objectService.objectDetail)),
        barcodeTag: JSON.parse(JSON.stringify(this.objectService.objectBarcodeTag))
      };
      this.bindExistingValue();
    }
    if (this.objectId && this.objectId > 0 && this.objectService.objectHeader === null) {
      this.loadObject();
    }
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      inventoryCountId: [0],
      inventoryCountNum: [null],
      description: [null],
      trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate()), [Validators.required]],
      locationId: [null, [Validators.required]],
      inventoryCountBatchId: [null, [Validators.required]],
      zoneId: [null],
      rackId: [null],
      inventoryCountUDField1: [null],
      inventoryCountUDField2: [null],
      inventoryCountUDField3: [null],
      inventoryCountUDOption1: [null],
      inventoryCountUDOption2: [null],
      inventoryCountUDOption3: [null],
      remark: [null, [Validators.maxLength(1000)]]
    })
  }

  ngOnInit() {

  }

  loadObject() {
    if (this.objectId && this.objectId > 0) {
      this.objectService.getInventoryCount(this.objectId).subscribe(response => {
        this.object = response;
        this.bindExistingValue();
      }, error => {
        console.error(error);
      })
    }
  }

  bindExistingValue() {
    // bind display
    this.object.header = this.commonService.convertObjectAllDateType(this.object.header);
    this.objectForm.patchValue(this.object.header);
    this.object.details.forEach(r => {
      if (r.itemCode === null || r.itemCode === undefined) {
        r.itemCode = this.object.barcodeTag.find(rr => rr.itemSku === r.itemSku)?.itemCode,
        r.description = this.object.barcodeTag.find(rr => rr.itemSku === r.itemSku)?.description
      }
    })
    this.dateValue = format(this.object.header.trxDate, "yyyy-MM-dd") + "T08:00:00.000Z";
    this.setFormattedDateString();
    this.onLocationSelected({ id: this.object.header.locationId });
  }

  inventoryCountBatchList: InventoryCountBatchList[] = [];
  inventoryCountBatchDdl: SearchDropdownList[] = [];
  @ViewChild("inventoryCountBatchSdd", { static: false }) inventoryCountBatchSdd: SearchDropdownPage;
  onLocationSelected(event: SearchDropdownList) {
    try {
      this.objectForm.patchValue({ locationId: null });
      if (this.objectId === null || this.objectId === undefined) {
        this.inventoryCountBatchSdd.clearSelected();
      }
      if (event) {
        this.objectForm.patchValue({ locationId: event.id });
        this.objectService.removeDetail();
        this.inventoryCountBatchDdl = [];
        this.objectService.getInventoryCountBatchByLocationId(this.objectForm.controls.locationId.value).subscribe(response => {
          this.inventoryCountBatchList = response;
          if (this.objectId && this.objectId > 0 && this.object) {
            this.object.header.inventoryCountBatchNum = this.inventoryCountBatchList?.find(r => r.inventoryCountBatchId === this.object.header.inventoryCountBatchId)?.inventoryCountBatchNum;
            this.object.header.inventoryCountBatchDescription = this.inventoryCountBatchList?.find(r => r.inventoryCountBatchId === this.object.header.inventoryCountBatchId)?.description;
          }
          if (this.inventoryCountBatchList.length > 0) {
            let temp: SearchDropdownList[] = [];
            this.inventoryCountBatchList.forEach(r => {
              temp.push({
                id: r.inventoryCountBatchId,
                code: r.inventoryCountBatchNum,
                description: r.description
              })
            })
            this.inventoryCountBatchDdl = JSON.parse(JSON.stringify(temp));
          }
        }, error => {
          throw error;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  onInventoryCountBatchChanged(event: SearchDropdownList) {
    this.objectForm.patchValue({ inventoryCountBatchId: null });
    if (event) {
      this.objectForm.patchValue({ inventoryCountBatchId: event.id });
    }
  }

  onZoneChanged(event: SearchDropdownList) {
    this.objectForm.patchValue({ zoneId: null });
    if (event) {
      this.objectForm.patchValue({ zoneId: event.id })
    }
  }

  onRackChanged(event: SearchDropdownList) {
    this.objectForm.patchValue({ rackId: null });
    if (event) {
      this.objectForm.patchValue({ rackId: event.id })
    }
  }

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
        if (this.objectId && this.objectId > 0) {
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: this.objectId
            }
          }
          this.navController.navigateRoot("/transactions/stock-count/stock-count-detail", navigationExtras);
        } else {
          this.navController.navigateBack("/transactions/stock-count");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  nextStep() {
    this.objectService.setHeader(this.objectForm.getRawValue());
    if (this.objectId && this.objectId > 0) {
      this.objectService.setDetail(this.object.details);
      this.objectService.setBarcodeTag(this.object.barcodeTag);
    }
    this.navController.navigateForward("/transactions/stock-count/stock-count-crud/stock-count-item");
  }

  /* #region calendar handle here */

  formattedDateString: string = "";
  dateValue = format(new Date(), "yyyy-MM-dd") + "T08:00:00.000Z";
  maxDate = format(new Date("2099-12-31"), "yyyy-MM-dd") + "T08:00:00.000Z";
  @ViewChild("datetime") datetime: IonDatetime
  setFormattedDateString() {
    this.formattedDateString = format(parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`), "MMM d, yyyy");
  }

  onTrxDateSelected(value: any) {
    this.dateValue = format(new Date(value), "yyyy-MM-dd") + "T08:00:00.000Z";
    this.setFormattedDateString();
    this.objectForm.patchValue({ trxDate: parseISO(format(new Date(this.dateValue), "yyyy-MM-dd") + `T00:00:00.000Z`) });
  }

  dateDismiss() {
    this.datetime.cancel(true);
  }

  dateSelect() {
    this.datetime.confirm(true);
  }

  /* #endregion */

}
