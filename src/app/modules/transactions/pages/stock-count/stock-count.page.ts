import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { StockCount } from '../../models/stock-count';
import { StockCountService } from '../../services/stock-count.service';

@Component({
  selector: 'app-stock-count',
  templateUrl: './stock-count.page.html',
  styleUrls: ['./stock-count.page.scss'],
})
export class StockCountPage implements OnInit, ViewWillEnter {

  startDate: Date;
  endDate: Date;

  objects: StockCount[] = [];

  constructor(
    private stockCountService: StockCountService,
    private commonService: CommonService,
    private toastService: ToastService,
    private modalController: ModalController,
    private navController: NavController,
    private actionSheetController: ActionSheetController
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

  loadObjects() {
    try {
      this.stockCountService.getInventoryCountByDate(format(this.startDate, 'yyyy-MM-dd'), format(this.endDate, 'yyyy-MM-dd')).subscribe(response => {
        this.objects = response;
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  goToDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/stock-count/stock-count-detail', navigationExtras);
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Choose an action',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Add Stock Count',
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

  addObject() {
    this.navController.navigateForward('/transactions/stock-count/stock-count-add/stock-count-header');
  }

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
}
