import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, ModalController, NavController, ActionSheetController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConsignmentCountService } from '../../services/consignment-count.service';
import { ConsignmentCountHeader } from '../../models/consignment-count';

@Component({
  selector: 'app-consignment-count',
  templateUrl: './consignment-count.page.html',
  styleUrls: ['./consignment-count.page.scss'],
})
export class ConsignmentCountPage implements OnInit, ViewWillEnter {

  objects: ConsignmentCountHeader[] = [];
  uniqueGrouping: Date[] = [];

  constructor(
    private authService: AuthService,
    public objectService: ConsignmentCountService,
    private commonService: CommonService,
    private toastService: ToastService,
    private modalController: ModalController,
    private navController: NavController,
    private actionSheetController: ActionSheetController
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
    return this.objects.filter(r => new Date(r.trxDate).getMonth() === date.getMonth() && new Date(r.trxDate).getFullYear() === date.getFullYear() && new Date(r.trxDate).getDate() === date.getDate());
  }

  goToDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward("/transactions/consignment-count/consignment-count-detail", navigationExtras);
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Choose an action",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Add Consignment Count",
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

  addObject() {
    this.navController.navigateForward("/transactions/consignment-count/consignment-count-header");
  }

}