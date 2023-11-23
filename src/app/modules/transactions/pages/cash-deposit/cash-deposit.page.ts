import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CashDeposit } from '../../models/cash-deposit';
import { CashDepositService } from '../../services/cash-deposit.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-cash-deposit',
  templateUrl: './cash-deposit.page.html',
  styleUrls: ['./cash-deposit.page.scss'],
})
export class CashDepositPage implements OnInit, ViewWillEnter {

  objects: CashDeposit[] = [];

  uniqueGrouping: Date[] = [];

  constructor(
    private authService: AuthService,
    private objectService: CashDepositService,
    private commonService: CommonService,
    private toastService: ToastService,
    private actionSheetController: ActionSheetController,
    private navController: NavController
  ) {
    this.objectService.loadRequiredMaster();
  }

  ionViewWillEnter(): void {
    this.loadObjects();
  }
  
  ngOnInit() {
    
  }

  loadObjects() {
    try {
      this.objectService.getObjects().subscribe(async response => {
        this.objects = response;
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.depositDateTime))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
      }, error => {
        console.error(error);
      })
    } catch (e) {
      console.error(e);
    }
  }

  getObjects(date: Date) {
    return this.objects.filter(r => new Date(r.depositDateTime).getMonth() === date.getMonth() && new Date(r.depositDateTime).getFullYear() === date.getFullYear() && new Date(r.depositDateTime).getDate() === date.getDate());
  }

  /* #region  add object */

  async addObject() {    
    this.navController.navigateForward("/transactions/cash-deposit/cash-deposit-add");
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Choose an action",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Add Cash Deposit",
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
  
  goToDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward("/transactions/cash-deposit/cash-deposit-detail", navigationExtras);
  }

}
