import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, IonDatetime, NavController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { StockCountRoot } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-stock-count-header-edit',
  templateUrl: './stock-count-header-edit.page.html',
  styleUrls: ['./stock-count-header-edit.page.scss'],
})
export class StockCountHeaderEditPage implements OnInit {

  objectId: number;
  objectForm: FormGroup;

  inventoryCount: StockCountRoot;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private toastService: ToastService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    public objectService: StockCountService,
    private actionSheetController: ActionSheetController
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
    this.setFormattedDateString();
    this.newObjectForm();
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
    if (this.objectId) {
      this.loadObject();
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

  loadObject() {
    try {
      this.objectService.getInventoryCount(this.objectId).subscribe(response => {
        this.inventoryCount = response;
        this.inventoryCount.details.forEach(r => {
          r.itemCode = this.inventoryCount.barcodeTag.find(rr => rr.itemSku === r.itemSku).itemCode;
          r.description = this.inventoryCount.barcodeTag.find(rr => rr.itemSku === r.itemSku).description;
        })
        this.commonService.convertObjectAllDateType(this.inventoryCount.header);
        this.objectForm.patchValue(this.inventoryCount.header);
        this.dateValue = format(new Date(this.objectForm.controls.trxDate.value), "yyyy-MM-dd") + "T08:00:00.000Z";
        this.setFormattedDateString();
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  async cancelEdit() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Are you sure to cancel?',
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
        let navigationExtras: NavigationExtras = {
          queryParams: {
            objectId: this.objectId
          }
        }
        this.navController.navigateBack('/transactions/stock-count/stock-count-detail', navigationExtras);
      }
    } catch (e) {
      console.error(e);
    }
  }

  nextStep() {
    this.objectService.setHeader(this.objectForm.getRawValue());
    this.objectService.setLines(this.inventoryCount.details);
    this.navController.navigateForward('/transactions/stock-count/stock-count-edit/stock-count-item');
  }

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
