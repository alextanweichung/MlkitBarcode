import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { OtherSalesList } from '../../models/other-sales';
import { OtherSalesService } from '../../services/other-sales.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-other-sales',
  templateUrl: './other-sales.page.html',
  styleUrls: ['./other-sales.page.scss'],
})
export class OtherSalesPage implements OnInit {

  content_loaded: boolean = false;
  objects: OtherSalesList[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private commonService: CommonService,
    private otherSalesService: OtherSalesService,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
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
    this.otherSalesService.getOtherSalesListByDate(this.startDate, this.endDate).subscribe(response => {
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

  /* #region  add other sales */

  async addObject() {
    // let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    // if (salesAgentId === 0 || salesAgentId === undefined) {
    //   this.toastService.presentToast('Error', 'Sales Agent not set', 'bottom', 'danger', 1000);
    // } else {
      this.navController.navigateForward('/transactions/other-sales/other-sales-add/other-sales-header');
    // }
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
          text: 'Add Other Sales',
          icon: 'document-outline',
          handler: () => {
            this.addObject();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  goToDetail(otherSalesId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        otherSalesId: otherSalesId
      }
    }
    this.navController.navigateForward('/transactions/other-sales/other-sales-detail', navigationExtras);
  }

}
