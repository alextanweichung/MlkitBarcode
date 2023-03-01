import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConsignmentSalesList } from '../../models/consignment-sales';
import { ConsignmentSalesService } from '../../services/consignment-sales.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-consignment-sales',
  templateUrl: './consignment-sales.page.html',
  styleUrls: ['./consignment-sales.page.scss'],
})
export class ConsignmentSalesPage implements OnInit {

  objects: ConsignmentSalesList[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private commonService: CommonService,
    private consignmentSalesService: ConsignmentSalesService,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTheYear();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  /* #region  crud */

  loadObjects() {
    this.consignmentSalesService.getObjectListByDate(format(this.startDate, 'yyyy-MM-dd'), format(this.endDate, 'yyyy-MM-dd')).subscribe(response => {
      this.objects = response;
    }, error => {
      console.log((error));
    })
  }

  /* #endregion */

  /* #region  add other sales */

  async addObject() {
    // let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    // if (salesAgentId === 0 || salesAgentId === undefined) {
    //   this.toastService.presentToast('Error', 'Sales Agent not set', 'top', 'danger', 1000);
    // } else {
      this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-header-add');
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
          text: 'Add Consignment Sales',
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

  goToDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-detail', navigationExtras);
  }

}
