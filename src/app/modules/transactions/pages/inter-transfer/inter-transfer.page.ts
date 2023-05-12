import { Component, OnInit } from '@angular/core';
import { InterTransferService } from '../../services/inter-transfer.service';
import { InterTransferList } from '../../models/inter-transfer';
import { ActionSheetController, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { CommonService } from 'src/app/shared/services/common.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { format } from 'date-fns';
import { FilterPage } from '../filter/filter.page';
import { NavigationExtras } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-inter-transfer',
  templateUrl: './inter-transfer.page.html',
  styleUrls: ['./inter-transfer.page.scss'],
})
export class InterTransferPage implements OnInit, ViewWillEnter {

  startDate: Date = null;
  endDate: Date = null;

  objects: InterTransferList[] = [];

  uniqueGrouping: Date[] = [];

  constructor(
    private authService: AuthService,
    private objectService: InterTransferService,
    private commonService: CommonService,
    private toastService: ToastService,
    private modalController: ModalController,
    private navController: NavController,
    private actionSheetController: ActionSheetController
  ) {
    // reload all masterlist whenever user enter listing
    this.objectService.loadRequiredMaster();
  }

  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTheYear();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadMasterList();
    this.loadObjects();
  }

  ngOnInit() {

  }

  loadMasterList() {

  }

  loadObjects() {
    if (this.startDate && this.endDate) {
      this.objectService.getObjectList(format(this.startDate, 'yyyy-MM-dd'), format(this.endDate, 'yyyy-MM-dd')).subscribe(async response => {
        this.objects = response;
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, 'top', 'success', 1000, this.authService.showSearchResult);
      })
    } else {
      this.toastService.presentToast("Invalid Search", "Please Select Date Range." , "top", "danger", 1000);
    }
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
  }

  goToDetail(objectId: number) {
    try {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          objectId: objectId
        }
      }
      this.navController.navigateForward('/transactions/inter-transfer/inter-transfer-detail', navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

  async addObject() {
    try {
      this.navController.navigateForward('/transactions/inter-transfer/inter-transfer-header');
    } catch (e) {
      console.error(e);
    }
  }

  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Choose an action',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Add Inter Transfer',
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
