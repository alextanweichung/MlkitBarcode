import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { InboundScanService } from '../../services/inbound-scan.service';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { InboundScanList } from '../../models/inbound-scan';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-inbound-scan',
  templateUrl: './inbound-scan.page.html',
  styleUrls: ['./inbound-scan.page.scss'],
})
export class InboundScanPage implements OnInit {

  objects: InboundScanList[] = [];

  startDate: Date;
  endDate: Date;

  uniqueGrouping: Date[] = [];

  constructor(
    private authService: AuthService,
    private objectService: InboundScanService,
    private commonService: CommonService,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private toastService: ToastService
  ) {
    // reload all masterlist whenever user enter listing
    this.objectService.loadRequiredMaster();
  }

  ngOnInit() {
    try {
      if (!this.startDate) {
        this.startDate = this.commonService.getFirstDayOfTodayMonth();
      }
      if (!this.endDate) {
        this.endDate = this.commonService.getTodayDate();
      }
      this.loadObjects();
    } catch (e) {
      console.error(e);
    }
  }

  /* #region  crud */

  loadObjects() {
    try {
      this.objectService.getObjectListByDate(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
        this.objects = response;
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate()).sort((a, c) => { return a.inboundScanId < c.inboundScanId ? 1 : -1 });
  }

  /* #endregion */

  /* #region add inbound scan */

  async addObject() {
    try {
      if (this.objectService.hasWarehouseAgent()) {
        this.navController.navigateForward("/transactions/inbound-scan/inbound-scan-header");
      } else {
        this.toastService.presentToast("", "Warehouse Agent not set.", "top", "danger", 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Choose an action",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Add Inbound scan",
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
      this.navController.navigateForward("/transactions/inbound-scan/inbound-scan-detail", navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
