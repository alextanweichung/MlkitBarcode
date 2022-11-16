import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { CommonService } from 'src/app/shared/services/common.service';
import { StockCount, StockCountList } from '../../models/stock-count';
import { StockCountService } from '../../services/stock-count.service';

@Component({
  selector: 'app-stock-count',
  templateUrl: './stock-count.page.html',
  styleUrls: ['./stock-count.page.scss'],
})
export class StockCountPage implements OnInit {

  startDate: Date;
  endDate: Date;

  stockCounts: StockCount[] = [];
  // stockCountList: StockCountList[] = [];

  constructor(
    private stockCountService: StockCountService,
    private commonService: CommonService,
    private modalController: ModalController,
    private navController: NavController,
    private actionSheetController: ActionSheetController
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

  loadObjects() {
    this.stockCountService.getInventoryCountByDate(format(this.startDate, 'yyyy-MM-dd'), format(this.endDate, 'yyyy-MM-dd')).subscribe(response => {
      this.stockCounts = response;
    }, error => {
      console.log(error);
    })
  }

  goToDetail(inventoryCountId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        inventoryCountId: inventoryCountId
      }
    }
    this.navController.navigateForward('/others/stock-count/stock-count-detail', navigationExtras);
  }

  // Select action
  async selectAction() {
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
  }

  addObject() {
    this.navController.navigateForward('/others/stock-count/stock-count-add/stock-count-header');
  }

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
}
