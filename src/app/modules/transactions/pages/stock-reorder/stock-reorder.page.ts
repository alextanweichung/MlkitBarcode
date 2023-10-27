import { Component, DoCheck, IterableDiffers, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, ViewDidEnter, ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { StockReorderList } from '../../models/stock-reorder';
import { StockReorderService } from '../../services/stock-reorder.service';
import { FilterPage } from '../filter/filter.page';

@Component({
  selector: 'app-stock-reorder',
  templateUrl: './stock-reorder.page.html',
  styleUrls: ['./stock-reorder.page.scss'],
})
export class StockReorderPage implements OnInit, ViewWillEnter, ViewDidEnter, DoCheck {

  private objectDiffer: any;
  objects: StockReorderList[] = [];

  startDate: Date;
  endDate: Date;
  customerIds: number[] = [];
  salesAgentIds: number[] = [];

  uniqueGrouping: Date[] = [];

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    private objectService: StockReorderService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private navController: NavController,
    private toastService: ToastService,
    private differs: IterableDiffers
  ) {
    // reload all masterlist whenever user enter listing
    this.objectService.loadRequiredMaster();
    this.objectDiffer = this.differs.find(this.objects).create();
  }

  ngDoCheck(): void {
    const objectChanges = this.objectDiffer.diff(this.objects);
    if (objectChanges) {
      this.bindUniqueGrouping();
    }
  }

  ionViewWillEnter(): void {
    this.objectService.resetVariables();
    this.objects = []; // clear list when enter
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
  }

  ionViewDidEnter(): void {
    this.loadObjects();
  }

  ngOnInit() {

  }

  /* #region crud */

  async loadObjects() {
    try {
      this.objectService.getObjectList(format(this.startDate, "yyyy-MM-dd"),format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
        this.objects = response;
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
      }, async error => {
        console.error(error);;
      })
    } catch (error) {
      this.toastService.presentToast("", "Error loading object.", "top", "danger", 1000);
    }
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
  }  

  async bindUniqueGrouping() {
    let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
    this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
    await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
  }

  /* #endregion */

  /* #region add */

  async addObject() {
    this.navController.navigateForward("/transactions/stock-reorder/stock-reorder-add");
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Choose an action",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Add Stock Reorder",
            icon: "document-outline",
            handler: () => {
              this.addObject();
            }
          },
          {
            text: "Cancel",
            icon: "close",
            role: "cancel"
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
          endDate: this.endDate,
        },
        canDismiss: true
      })
      await modal.present();
      let { data } = await modal.onWillDismiss();
      if (data && data !== undefined) {
        this.objects = [];
        this.uniqueGrouping = [];
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
      this.navController.navigateForward("/transactions/stock-reorder/stock-reorder-detail", navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
