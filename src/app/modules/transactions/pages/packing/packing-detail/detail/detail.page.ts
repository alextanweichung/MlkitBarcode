import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  parent: string = 'Packing'

  packingId: number;
  packing: any;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    private packingService: PackingService
  ) {
    this.route.queryParams.subscribe(params => {
      this.packingId = params['packingId'];
      if (params['parent']) {
        this.parent = params['parent'];
      }
    })
  }

  ngOnInit() {
    if (!this.packingId) {
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/transactions')
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
    this.packingService.getMasterList().subscribe(response => {
      this.customerMasterList = response.filter(x => x.objectName == 'Customer').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemUomMasterList = response.filter(x => x.objectName == 'ItemUom').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.warehouseAgentMasterList = response.filter(x => x.objectName == 'WarehouseAgent').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  loadDetail() {
    this.packingService.getPackingDetail(this.packingId).subscribe(response => {
      console.log("🚀 ~ file: detail.page.ts ~ line 66 ~ DetailPage ~ this.packingService.getPackingDetail ~ response", response)
      this.packing = response;
    }, error => {
      console.log(error);
    })
  }

}
