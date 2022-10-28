import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController } from '@ionic/angular';
import { PickingSalesOrderRoot } from 'src/app/modules/transactions/models/picking-sales-order';
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
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0 && y.attribute5 === 'T');
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
  selectedCustomer: MasterListDetails;
  onCustomerSelected(event) {
    this.customerId = event ? event.id : null;
    if (this.customerId) {
      this.selectedCustomer = this.customerMasterList.find(r => r.id === this.customerId);
      this.loadSalesOrders();
    }
  }

  locationId: number;
  onLocationSelectd(event) {
    this.locationId = event ? event.id : null;
  }

  pickingSalesOrders: PickingSalesOrderRoot[] = [];
  loadSalesOrders() {
    if (this.customerId) {
      this.pickingService.getSalesOrders(this.customerId).subscribe(response => {
        this.pickingSalesOrders = response;
      })
    } else {
      this.toastService.presentToast('Please select Customer', '', 'bottom', 'danger', 1500);
    }
  }

  selectedSO: PickingSalesOrderRoot;
  salesOrderSelected(pickingSalesOrder: PickingSalesOrderRoot) {
    this.selectedSO = pickingSalesOrder;
    this.nextStep();
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

  nextStep() {
    if (this.selectedCustomer && this.selectedSO) {
      this.pickingService.setChoosenCustomer(this.selectedCustomer);
      this.pickingService.setChoosenSalesOrder(this.selectedSO);
      this.navController.navigateForward('/transactions/picking/picking-item');
    } else {
      this.toastService.presentToast('Something went wrong.', '', 'bottom', 'danger', 1500);
    }
  }

}
