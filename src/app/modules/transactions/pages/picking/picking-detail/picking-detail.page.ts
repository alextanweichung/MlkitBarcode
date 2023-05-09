import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-picking-detail',
  templateUrl: './picking-detail.page.html',
  styleUrls: ['./picking-detail.page.scss'],
})
export class PickingDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: any;

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

  loadDetail() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

}
