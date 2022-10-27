import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';

@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.page.html',
  styleUrls: ['./sales-order.page.scss'],
})
export class SalesOrderPage implements OnInit {

  constructor(
    private pickingService: PickingService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadMasterList();
  }

  customerMasterList: MasterListDetails[] = [];
  itemUomMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  warehouseAgentMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.pickingService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemUomMasterList = response.filter(x => x.objectName == 'ItemUom').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.warehouseAgentMasterList = response.filter(x => x.objectName == 'WarehouseAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.mapSearchDropdownList();
    }, error => {
      console.log(error);
    })
  }

  customerSearchDropdownList: SearchDropdownList[] = [];
  locationSearchDropdownList: SearchDropdownList[] = [];
  mapSearchDropdownList() {
    this.customerMasterList.forEach(r => {
      this.customerSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
    this.locationMasterList.forEach(r => {
      this.locationSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
  }

  customerId: number;
  onCustomerSelected(event) {
    this.customerId = event ? event.id : null;
  }

  locationId: number;
  onLocationSelectd(event) {
    this.locationId = event ? event.id : null;
  }

  loadSalesOrders() {
    if (this.customerId && this.locationId) {
      this.pickingService.getSalesOrders(this.customerId, this.locationId).subscribe(response => {        
        console.log("🚀 ~ file: sales-order.page.ts ~ line 80 ~ SalesOrderPage ~ this.pickingService.getSalesOrders ~ response", response)
      })
    } else {
      this.toastService.presentToast('Please select Customer and Location', '', 'top', 'danger', 1500);
    }
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
      this.navController.navigateBack('/transactions/picking');
    }
  }

}
