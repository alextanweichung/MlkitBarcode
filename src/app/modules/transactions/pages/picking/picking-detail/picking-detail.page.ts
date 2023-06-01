import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MultiPickingRoot } from '../../../models/picking';

@Component({
  selector: 'app-picking-detail',
  templateUrl: './picking-detail.page.html',
  styleUrls: ['./picking-detail.page.scss'],
})
export class PickingDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: MultiPickingRoot;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    public objectService: PickingService
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/picking');
      }
    })
  }

  ionViewWillEnter(): void {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/picking')
    } else {
      this.loadDetail();
    }
  }

  ngOnInit() {

  }

  uniqueSalesOrder: string[] = [];
  loadDetail() {
    this.uniqueSalesOrder = []
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        console.log("🚀 ~ file: picking-detail.page.ts:47 ~ PickingDetailPage ~ this.objectService.getObjectById ~ response:", response);
        this.object = response;
        if (this.object.outstandingPickList && this.object.outstandingPickList.length > 0) {
          this.uniqueSalesOrder = [...new Set(this.object.outstandingPickList.flatMap(r => r.salesOrderNum))];
        }
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #region find outstanding item in this SO */

  getItemOfSO(salesOrderNum: string) {
    let find = this.object.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum);
    if (find && find.length > 0) {
      return find;
    }
    return null;
  }

  /* #endregion */

}
