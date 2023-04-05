import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { GoodsPackingList } from '../../models/packing';
import { PackingService } from '../../services/packing.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-packing',
  templateUrl: './packing.page.html',
  styleUrls: ['./packing.page.scss'],
})
export class PackingPage implements OnInit, ViewWillEnter {

  objects: GoodsPackingList[] = [];

  startDate: Date;
  endDate: Date;

  uniqueGrouping: Date[] = [];

  constructor(
    private commonService: CommonService,
    private configService: ConfigService,
    private goodsPackingService: PackingService,
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
      this.goodsPackingService.getObjectListByDate(this.startDate, this.endDate).subscribe(async response => {
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

  /* #region  add packing */

  async addObject() {
    try {
      if (this.goodsPackingService.hasWarehouseAgent()) {
        this.navController.navigateForward('/transactions/packing/packing-sales-order');
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
      this.navController.navigateForward('/transactions/packing/packing-detail', navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
