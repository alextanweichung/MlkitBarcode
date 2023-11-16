import { Component, DoCheck, IterableDiffers, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ViewWillEnter, ViewDidEnter, ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferInHeader, TransferInList } from '../../models/transfer-in';
import { TransferInService } from '../../services/transfer-in.service';
import { FilterPage } from '../filter/filter.page';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { ConfigService } from 'src/app/services/config/config.service';

@Component({
  selector: 'app-transfer-in',
  templateUrl: './transfer-in.page.html',
  styleUrls: ['./transfer-in.page.scss'],
})
export class TransferInPage implements OnInit, ViewWillEnter, ViewDidEnter, DoCheck {

  private objectDiffer: any;

  objects: TransferInList[] = [];

  startDate: Date;
  endDate: Date;
  customerIds: number[] = [];
  salesAgentIds: number[] = [];

  uniqueGrouping: Date[] = [];

  constructor(
    public objectService: TransferInService,
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private navController: NavController,
    private differs: IterableDiffers
  ) {
    this.objectDiffer = this.differs.find(this.objects).create();
  }

  ngDoCheck(): void {
    const objectChanges = this.objectDiffer.diff(this.objects);
    if (objectChanges) {
      this.bindUniqueGrouping();
    }
  }

  async ionViewWillEnter(): Promise<void> {
    this.objects = []; // clear list when enter
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    await this.objectService.resetVariables();
    // reload all masterlist whenever user enter listing
    await this.objectService.loadRequiredMaster();
    // await this.bindLocationList();
    if (this.configService.selected_location) {
      this.objectService.selectedLocation = this.configService.selected_location;
      await this.loadPendingList();
    }
  }

  async ionViewDidEnter(): Promise<void> {
    await this.loadObjects();
  }

  ngOnInit() {

  }

  /* #region pending objects */

  // consignmentLocationSearchDropdownList: SearchDropdownList[] = [];
  // bindLocationList() {
  //   this.consignmentLocationSearchDropdownList = [];
  //   try {
  //     this.objectService.locationList.forEach(r => {
  //       this.consignmentLocationSearchDropdownList.push({
  //         id: r.locationId,
  //         code: r.locationCode,
  //         description: r.locationDescription
  //       })
  //     })
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  onLocationChanged(event: any) {
    if (event) {
      this.objectService.selectedLocation = event.id;
      this.loadPendingList();
    }
  }

  pendingObject: TransferInHeader[] = [];
  async loadPendingList() {
    try {
      await this.loadingService.showLoading();
      this.pendingObject = [];
      if (this.objectService.selectedLocation) {
        this.objectService.getPendingList(this.objectService.locationMasterList.find(r => r.id === this.objectService.selectedLocation)?.code).subscribe(async response => {
          this.pendingObject = response;
          await this.loadingService.dismissLoading();
        }, async error => {
          await this.loadingService.dismissLoading();
          console.error(error);
        })
      } else {
        await this.loadingService.dismissLoading();
      }
    } catch (error) {
      await this.loadingService.dismissLoading();
      console.error(error);
    } finally {
      await this.loadingService.dismissLoading();
    }
  }

  selectDoc(object: TransferInHeader) {
    object.line.forEach(r => {
      if (r.qtyReceive === null) {
        r.qtyReceive = r.qty;
      }
    })
    this.objectService.setHeader(object);
    this.navController.navigateRoot("/transactions/transfer-in/transfer-in-item");
  }

  /* #endregion */

  /* #region completed object */

  async loadObjects() {
    try {
      await this.loadingService.showLoading();
      this.objectService.getObjectList(format(this.startDate, "yyyy-MM-dd"), format(this.endDate, "yyyy-MM-dd")).subscribe(async response => {
        this.objects = response;
        this.objects = this.objects.filter(r => r.isCompleted);
        await this.loadingService.dismissLoading();
        this.toastService.presentToast("Search Complete", `${this.objects.length} record(s) found.`, "top", "success", 1000, this.authService.showSearchResult);
      }, async error => {
        await this.loadingService.dismissLoading();
        console.error(error);
      })
    } catch (error) {
      await this.loadingService.dismissLoading();
      this.toastService.presentToast("System Error", "Please contact adminstrator", "top", "danger", 1000);
    } finally {
      await this.loadingService.dismissLoading();
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
      this.navController.navigateForward("/transactions/transfer-in/transfer-in-detail", navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
