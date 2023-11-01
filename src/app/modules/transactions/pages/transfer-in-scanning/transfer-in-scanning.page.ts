import { Component, DoCheck, IterableDiffers, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { FilterPage } from '../filter/filter.page';
import { format } from 'date-fns';
import { ViewWillEnter, ViewDidEnter, ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferInScanningList, TransferInScanningRoot } from '../../models/transfer-in-scanning';
import { TransferInScanningService } from '../../services/transfer-in-scanning.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { ConsignmentSalesLocation } from '../../models/consignment-sales';

@Component({
  selector: 'app-transfer-in-scanning',
  templateUrl: './transfer-in-scanning.page.html',
  styleUrls: ['./transfer-in-scanning.page.scss'],
})
export class TransferInScanningPage implements OnInit, ViewWillEnter, ViewDidEnter, DoCheck {

  private objectDiffer: any;
  objects: TransferInScanningList[] = [];

  startDate: Date;
  endDate: Date;

  uniqueGrouping: Date[] = [];

  constructor(
    private authService: AuthService,
    private commonService: CommonService,
    public objectService: TransferInScanningService,
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
    if (this.objectService.locationList.findIndex(r => r.isPrimary) > -1) {
      this.selectedLocation = this.objectService.locationList.find(r => r.isPrimary);
      this.loadPendingList();
    }
    this.bindLocationList();
    this.loadObjects();
  }

  ngOnInit() {

  }

  /* #region pending objects */

  consignmentLocationSearchDropdownList: SearchDropdownList[] = [];
  bindLocationList() {
    this.consignmentLocationSearchDropdownList = [];
    try {
      this.objectService.locationList.forEach(r => {
        this.consignmentLocationSearchDropdownList.push({
          id: r.locationId,
          code: r.locationCode,
          description: r.locationDescription
        })
      })
    } catch (e) {
      console.error(e);
    }
  }

  selectedLocation: ConsignmentSalesLocation = null;
  onLocationChanged(event: any) {
    if (event) {
      this.selectedLocation = this.objectService.locationList.find(r => r.locationId === event.id);
      this.loadPendingList();
    }
  }

  pendingObject: TransferInScanningRoot[] = [];
  loadPendingList() {
    this.pendingObject = [];
    if (this.selectedLocation) {
      this.objectService.getPendingList(this.selectedLocation.locationCode).subscribe(response => {
        this.pendingObject = response;
      }, error => {
        console.error(error);
      })
    }
  }

  selectDoc(object: TransferInScanningRoot) {
    this.objectService.setObject(object);
    this.navController.navigateForward("/transactions/transfer-in-scanning/transfer-in-scanning-item");
  }

  /* #endregion */

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
      this.navController.navigateForward("/transactions/transfer-in-scanning/transfer-in-scanning-detail", navigationExtras);
    } catch (e) {
      console.error(e);
    }
  }

}
