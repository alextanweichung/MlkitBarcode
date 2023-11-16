import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConsignmentSalesList } from '../../models/consignment-sales';
import { ConsignmentSalesService } from '../../services/consignment-sales.service';
import { FilterPage } from '../filter/filter.page';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-consignment-sales',
  templateUrl: './consignment-sales.page.html',
  styleUrls: ['./consignment-sales.page.scss'],
})
export class ConsignmentSalesPage implements OnInit, ViewWillEnter, ViewDidEnter {

  objects: ConsignmentSalesList[] = [];

  startDate: Date;
  endDate: Date;

  uniqueGrouping: Date[] = [];

  constructor(
    private objectService: ConsignmentSalesService,
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private navController: NavController
  ) { 
  }

  async ionViewWillEnter(): Promise<void> {
    // reload all masterlist whenever user enter listing
    try {
      await this.objectService.loadRequiredMaster();
    } catch (error) {
      console.error(error);
    }
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

  async ionViewDidEnter(): Promise<void> {
    // check incomplete trx here
    let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
    if (data !== null) {
      if (data?.header?.toLocationId === this.configService?.selected_location) {
        this.promptIncompleteTrxAlert();
      } else {
        
      }
    }
  }

  async ngOnInit() {
    
  }

  async promptIncompleteTrxAlert() {
    const alert = await this.alertController.create({
      cssClass: "custom-alert",
      header: "You have uncompleted transaction.",
      subHeader: "Do you want to retrieve or discard",
      backdropDismiss: false,
      buttons: [
        {
          text: "Retrieve",
          cssClass: "success",
          handler: async () => {
            let data = await this.configService.retrieveFromLocalStorage(this.objectService.trxKey);
            await this.objectService.setHeader(data.header);
            await this.objectService.setLines(data.details);
            this.navController.navigateRoot("/transactions/consignment-sales/consignment-sales-item");
          }
        },
        {
          text: "Discard",
          role: "cancel",
          cssClass: "cancel",
          handler: async () => {
            await this.configService.removeFromLocalStorage(this.objectService.trxKey);
          }
        }
      ]
    });
    await alert.present();
  }

  /* #region  crud */

  async loadObjects() {
    try {
      await this.loadingService.showLoading();
      this.objectService.getObjectListByDate(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
        this.objects = response;
        let dates = [...new Set(this.objects.map(obj => this.commonService.convertDateFormatIgnoreTime(new Date(obj.trxDate))))];
        this.uniqueGrouping = dates.map(r => r.getTime()).filter((s, i, a) => a.indexOf(s) === i).map(s => new Date(s));
        await this.uniqueGrouping.sort((a, c) => { return a < c ? 1 : -1 });
        await this.loadingService.dismissLoading();
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
      }, async error => {
        await this.loadingService.dismissLoading();
        console.error(error);
      })
    } catch (e) {
      await this.loadingService.dismissLoading();
      console.error(e);
    } finally {      
      await this.loadingService.dismissLoading();
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
    this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-detail", navigationExtras);
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

  /* #region add */

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Choose an action",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Add Consignment Sales",
            icon: "document-outline",
            handler: () => {
              this.addObject();
            }
          },
          {
            text: "Cancel",
            icon: "close",
            role: "cancel"
          }
        ]
      });
      await actionSheet.present();
    } catch (e) {
      console.error(e);
    }
  }

  async addObject() {
    this.navController.navigateForward("/transactions/consignment-sales/consignment-sales-header");
  }

  /* #endregion */

}
