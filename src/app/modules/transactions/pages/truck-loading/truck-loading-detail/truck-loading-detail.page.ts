import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { TruckLoadingRoot } from '../../../models/truck-loading';
import { TruckLoadingService } from '../../../services/truck-loading.service';

@Component({
  selector: 'app-truck-loading-detail',
  templateUrl: './truck-loading-detail.page.html',
  styleUrls: ['./truck-loading-detail.page.scss'],
})
export class TruckLoadingDetailPage implements OnInit {

  objectId: number;
  object: TruckLoadingRoot;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    private objectService: TruckLoadingService
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/truck-loading');
      }
    })
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/truck-loading')
    } else {
      this.loadMasterList();
      this.loadDetail();
    }
  }

  shipMethodMasterList: MasterListDetails[] = [];
  vendorMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.shipMethodMasterList = response.filter(x => x.objectName == 'ShipMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.vendorMasterList = response.filter(x => x.objectName == 'Vendor').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }
  
  loadDetail() {
    this.objectService.getObject(this.objectId).subscribe(response => {
      this.object = response;
      console.log("🚀 ~ file: truck-loading-detail.page.ts:56 ~ TruckLoadingDetailPage ~ this.objectService.getObject ~ this.object", this.object)
    }, error => {
      console.log(error);
    })
  }

}
