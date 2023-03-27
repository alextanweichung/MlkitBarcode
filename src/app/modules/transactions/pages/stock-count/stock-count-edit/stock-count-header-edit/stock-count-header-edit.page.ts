import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController } from '@ionic/angular';
import { StockCountRoot } from 'src/app/modules/transactions/models/stock-count';
import { StockCountService } from 'src/app/modules/transactions/services/stock-count.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
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
    private stockCountService: StockCountService,
    private actionSheetController: ActionSheetController
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
    this.newObjectForm();
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      inventoryCountId: [0],
      inventoryCountNum: [null],
      description: [null],
      trxDate: [this.commonService.convertUtcDate(this.commonService.getTodayDate()), [Validators.required]],
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
    this.loadMasterList();
    if (this.objectId) {
      this.loadObject();
    }
  }

  locationMasterList: MasterListDetails[] = [];
  zoneMasterList: MasterListDetails[] = [];
  rackMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.stockCountService.getMasterList().subscribe(async response => {
        this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.zoneMasterList = response.filter(x => x.objectName == 'Zone').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.rackMasterList = response.filter(x => x.objectName == 'Rack').flatMap(src => src.details).filter(y => y.deactivated == 0);
        await this.mapSearchDropdownList();
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  rackSearchDdl: SearchDropdownList[] = [];
  zoneSearchDdl: SearchDropdownList[] = [];
  mapSearchDropdownList() {
    try {
      let rack: SearchDropdownList[] = [];
      let zone: SearchDropdownList[] = [];
      this.rackMasterList.forEach(r => {
        rack.push({
          id: r.id,
          code: r.code,
          description: r.description
        })
      })
      this.rackSearchDdl = [...rack];
      this.zoneMasterList.forEach(r => {
        zone.push({
          id: r.id,
          code: r.code,
          description: r.description
        })
      })
      this.zoneSearchDdl = [...zone]
    } catch (e) {
      console.error(e);
    }
  }

  onTrxDateSelected(event: Date) {
    this.objectForm.patchValue({ trxDate: event });
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
      this.stockCountService.getInventoryCount(this.objectId).subscribe(response => {
        this.inventoryCount = response;
        this.inventoryCount.details.forEach(r => {
          r.itemCode = this.inventoryCount.barcodeTag.find(rr => rr.itemSku === r.itemSku).itemCode;
          r.description = this.inventoryCount.barcodeTag.find(rr => rr.itemSku === r.itemSku).description;
        })
        this.commonService.convertObjectAllDateType(this.inventoryCount.header);
        this.objectForm.patchValue(this.inventoryCount.header);
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
        this.stockCountService.resetVariables();
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
    this.stockCountService.setHeader(this.objectForm.getRawValue());
    this.stockCountService.setLines(this.inventoryCount.details);
    this.navController.navigateForward('/transactions/stock-count/stock-count-edit/stock-count-item');
  }

}
