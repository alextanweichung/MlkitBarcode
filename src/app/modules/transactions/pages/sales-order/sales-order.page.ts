import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SalesOrderList } from '../../models/sales-order';
import { CommonService } from '../../services/common.service';
import { SalesOrderService } from '../../services/sales-order.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.page.html',
  styleUrls: ['./sales-order.page.scss'],
})
export class SalesOrderPage implements OnInit {

  content_loaded: boolean = false;
  objects: SalesOrderList[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private commonService: CommonService,
    private salesOrderService: SalesOrderService,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private navController: NavController,
    private toastService: ToastService  ) { }

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
    this.salesOrderService.getSalesOrderList(this.startDate, this.endDate).subscribe(response => {
      this.objects = response;
      if (this.objects.length > 0) {
        this.content_loaded = true;
      }
    }, error => {
      console.log((error));
    })
  }

  /* #endregion */

  /* #region  add quotation */

  async addObject() {
    let salesAgentId = JSON.parse(localStorage.getItem('loginUser'))?.salesAgentId;
    if (salesAgentId === 0 || salesAgentId === undefined) {
      this.toastService.presentToast('Error', 'Sales Agent not set', 'top', 'danger', 1500);
    } else {
      this.navController.navigateForward('/transactions/sales-order/sales-order-customer');
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
          text: 'Add Sales Order',
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

  goToDetail(salesOrderId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        salesOrderId: salesOrderId
      }
    }
    this.navController.navigateForward('/transactions/sales-order/sales-order-detail', navigationExtras);
  }

}
