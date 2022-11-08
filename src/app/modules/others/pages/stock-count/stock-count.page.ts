import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { StockCountList } from '../../models/stock-count';
import { StockCountService } from '../../services/stock-count.service';

@Component({
  selector: 'app-stock-count',
  templateUrl: './stock-count.page.html',
  styleUrls: ['./stock-count.page.scss'],
})
export class StockCountPage implements OnInit {

  startDate: Date;
  endDate: Date;

  stockCountList: StockCountList[] = [];

  constructor(
    private stockCountService: StockCountService,
    private commonService: CommonService,
    private modalController: ModalController,
    private navController: NavController
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
    this.stockCountService.getInventoryCountList().subscribe(response => {
      this.stockCountList = response;
      console.log("🚀 ~ file: stock-count.page.ts ~ line 39 ~ StockCountPage ~ this.stockCountService.getInventoryCountList ~ this.stockCountList", this.stockCountList)
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
