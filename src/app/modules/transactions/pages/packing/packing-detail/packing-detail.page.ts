import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-packing-detail',
  templateUrl: './packing-detail.page.html',
  styleUrls: ['./packing-detail.page.scss'],
})
export class PackingDetailPage implements OnInit {

  objectId: number;
  object: any;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    private packingService: PackingService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
        if (!this.objectId) {
          this.navController.navigateBack('/transactions/packing');
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/packing')
    } else {
      this.loadMasterList();
      this.loadDetail();
    }
  }

  customerMasterList: MasterListDetails[] = [];
  itemUomMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  locationMasterList: MasterListDetails[] = [];
  warehouseAgentMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.packingService.getMasterList().subscribe(response => {
        this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemUomMasterList = response.filter(x => x.objectName == 'ItemUom').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.warehouseAgentMasterList = response.filter(x => x.objectName == 'WarehouseAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  loadDetail() {
    try {
      this.packingService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

}
