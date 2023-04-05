import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from '../../../../shared/services/common.service';
import { PickingService } from '../../services/picking.service';
import { FilterPage } from '../filter/filter.page';
import { ConfigService } from 'src/app/services/config/config.service';
import { GoodsPickingList } from '../../models/picking';
import { format } from 'date-fns';

@Component({
  selector: 'app-picking',
  templateUrl: './picking.page.html',
  styleUrls: ['./picking.page.scss'],
})
export class PickingPage implements OnInit, ViewWillEnter {

  objects: GoodsPickingList[] = [];

  startDate: Date;
  endDate: Date;

  uniqueGrouping: Date[] = [];

  constructor(
    private commonService: CommonService,
    private configService: ConfigService,
    private goodsPickingService: PickingService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private toastService: ToastService
  ) { }

  ionViewWillEnter(): void {
    try {
      if (!this.startDate) {
        this.startDate = this.commonService.getFirstDayOfTheYear();
      }
      if (!this.endDate) {
        this.endDate = this.commonService.getTodayDate();
      }
      this.loadObjects();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {

  }

  /* #region  crud */

  loadObjects() {
    try {
      this.goodsPickingService.getObjectListByDate(format(this.startDate, 'yyyy-MM-dd'), format(this.endDate, 'yyyy-MM-dd')).subscribe(async response => {
        this.objects = response;
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
  }

  /* #endregion */

  /* #region  add goods picking */

  async addObject() {
    try {
      if (this.goodsPickingService.hasWarehouseAgent()) {
        this.navController.navigateForward('/transactions/picking/picking-sales-order');
      } else {
        this.toastService.presentToast('Warehouse Agent not set.', '', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Select action
  async selectAction() {
    try {
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
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  async filter() {
    try {
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
    } catch (e) {
      console.error(e);
    }
  }

  goToDetail(objectId: number) {
    try {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          objectId: objectId
        }
      }
      this.navController.navigateForward('/transactions/picking/picking-detail', navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
