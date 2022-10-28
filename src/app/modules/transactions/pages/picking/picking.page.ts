import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PickingList } from '../../models/picking';
import { CommonService } from '../../services/common.service';
import { PickingService } from '../../services/picking.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-picking',
  templateUrl: './picking.page.html',
  styleUrls: ['./picking.page.scss'],
})
export class PickingPage implements OnInit {

  content_loaded: boolean = false;
  objects: PickingList[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private commonService: CommonService,
    private pickingService: PickingService,
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
    this.pickingService.getPickingList(this.startDate, this.endDate).subscribe(response => {
      this.objects = response;
      if (this.objects.length > 0) {
        this.content_loaded = true;
      }
      this.toastService.presentToast('Search Completed.', '', 'bottom', 'success', 1500);
    }, error => {
      console.log((error));
    })
  }

  /* #endregion */

  /* #region  add picking */

  async addObject() {
    let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.warehouseAgentId;
    if (salesAgentId === 0 || salesAgentId === undefined) {
      this.toastService.presentToast('Warehouse Agent not set.', '', 'bottom', 'danger', 1500);
    } else {
      this.navController.navigateForward('/transactions/picking/picking-sales-order');
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
          text: 'Add Picking',
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

  goToDetail(pickingId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        pickingId: pickingId
      }
    }
    this.navController.navigateForward('/transactions/picking/picking-detail', navigationExtras);
  }

}
