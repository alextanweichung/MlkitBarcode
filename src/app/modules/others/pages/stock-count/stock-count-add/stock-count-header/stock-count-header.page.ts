import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, NavController } from '@ionic/angular';
import { StockCountService } from 'src/app/modules/others/services/stock-count.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
  selector: 'app-stock-count-header',
  templateUrl: './stock-count-header.page.html',
  styleUrls: ['./stock-count-header.page.scss'],
})
export class StockCountHeaderPage implements OnInit {

  objectForm: FormGroup;

  constructor(
    private stockCountService: StockCountService,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private formBuilder: FormBuilder
  ) { 
    this.newObjectForm();
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      inventoryCountId: [0],
      inventoryCountNum: [null],
      description: [null],
      trxDate: [null, [Validators.required]],
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
  }

  itemUomMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  rackMasterList: MasterListDetails[] = [];
  zoneMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.stockCountService.getMasterList().subscribe(response => {
      this.itemUomMasterList = response.filter(x => x.objectName == 'ItemUOM').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.rackMasterList = response.filter(x => x.objectName == 'Rack').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.zoneMasterList = response.filter(x => x.objectName == 'Zone').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.mapSearchDropdownList();
    }, error => {
      console.log(error);
    })
  }

  locationSearchDdl: SearchDropdownList[] = [];
  mapSearchDropdownList() {
    this.locationMasterList.forEach(r => {
      this.locationSearchDdl.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })

  }

  onTrxDateSelected(event: Date) {
    this.objectForm.patchValue({ trxDate: event });
  }

  onLocationSelected(event: SearchDropdownList) {
    this.objectForm.patchValue({ locationId: event.id });
    this.stockCountService.getInventoryCountBatchByLocationId(this.objectForm.controls.locationId.value).subscribe(response => {
    console.log("🚀 ~ file: stock-count-header.page.ts ~ line 89 ~ StockCountHeaderPage ~ this.stockCountService.getInventoryCountBatchByLocationId ~ response", response)

    }, error => {
      console.log(error);
    })
  }

  async cancelInsert() {
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
      // this.quotationService.resetVariables();
      this.navController.navigateBack('/others/stock-count');
    }
  }

  nextStep() {
    console.log("🚀 ~ file: stock-count-header.page.ts ~ line 98 ~ StockCountHeaderPage ~ nextStep ~ this.objectForm.getRawValue()", this.objectForm.getRawValue())
    // if (this.selectedCustomer) {
    //   this.quotationService.setChoosenCustomer(this.selectedCustomer);
    //   this.quotationService.removeItems();
    //   this.navController.navigateForward('/transactions/quotation/quotation-item');
    // } else {
    //   this.toastService.presentToast('Error', 'Please select customer to continue', 'bottom', 'danger', 1000);
    // }
  }

}
