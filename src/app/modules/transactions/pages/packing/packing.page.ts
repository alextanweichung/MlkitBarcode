import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PackingList } from '../../models/packing';
import { PackingService } from '../../services/packing.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-packing',
  templateUrl: './packing.page.html',
  styleUrls: ['./packing.page.scss'],
})
export class PackingPage implements OnInit {

  content_loaded: boolean = false;
  objects: PackingList[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private commonService: CommonService,
    private configService: ConfigService,
    private packingService: PackingService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  /* #region  crud */

  loadObjects() {
    this.packingService.getPackingList(this.startDate, this.endDate).subscribe(response => {
      this.objects = response;
      if (this.objects.length > 0) {
        this.content_loaded = true;
      }
      // this.toastService.presentToast('Search Completed.', '', 'bottom', 'success', 1000);
    }, error => {
      console.log((error));
    })
  }

  /* #endregion */

  /* #region  add picking */

  async addObject() {
    let warehouseAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
    if (warehouseAgentId === 0 || warehouseAgentId === undefined) {
      this.toastService.presentToast('Warehouse Agent not set.', '', 'bottom', 'danger', 1000);
    } else {
      this.navController.navigateForward('/transactions/packing/packing-sales-order');
    }
  }

  /* #endregion */

  async filter() {
    const modal = await this.modalController.create({
      component: FilterPage,
      componentProps: {
        startDate: this.startDate,
        endDate: this.endDate
      },
      canDismiss: true
    })

    await modal.present();

    let { data } = await modal.onWillDismiss();

    if (data && data !== undefined) {
      this.startDate = new Date(data.startDate);
      this.endDate = new Date(data.endDate);

      this.loadObjects();
    }
  }

  // Select action
  async selectAction() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose an action',
      cssClass: 'custom-action-sheet',
      buttons: [
        {
          text: 'Add Packing',
          icon: 'document-outline',
          handler: () => {
            this.addObject();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }]
    });
    await actionSheet.present();
  }

  goToDetail(packingId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        packingId: packingId
      }
    }
    this.navController.navigateForward('/transactions/packing/packing-detail', navigationExtras);
  }

}
