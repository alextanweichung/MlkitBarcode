import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, ViewWillEnter } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { TruckLoadingHeader } from '../../models/truck-loading';
import { TruckLoadingService } from '../../services/truck-loading.service';

@Component({
  selector: 'app-truck-loading',
  templateUrl: './truck-loading.page.html',
  styleUrls: ['./truck-loading.page.scss'],
})
export class TruckLoadingPage implements OnInit, ViewWillEnter {

  objects: TruckLoadingHeader[] = [];

  constructor(
    private objectService: TruckLoadingService,
    private toastService: ToastService,
    private actionSheetController: ActionSheetController,
    private navController: NavController
  ) { }

  ionViewWillEnter(): void {
    this.loadObjects();
  }

  ngOnInit() {
    this.loadMasterList();
  }

  loadObjects() {
    try {
      this.objectService.getObjects().subscribe(response => {
        this.objects = response;
        this.toastService.presentToast('Search Complete', `${this.objects.length} record(s) found.`, 'top', 'success', 1000);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  shipMethodMasterList: MasterListDetails[] = [];
  vendorMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.objectService.getMasterList().subscribe(response => {
        this.shipMethodMasterList = response.filter(x => x.objectName == 'ShipMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.vendorMasterList = response.filter(x => x.objectName == 'Vendor').flatMap(src => src.details).filter(y => y.deactivated == 0);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #region  add object */

  async addObject() {    
    this.navController.navigateForward('/transactions/truck-loading/truck-loading-add');
  }

  // Select action
  async selectAction() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Choose an action',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Add Truck Loading',
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

  /* #endregion */
  
  goToDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/truck-loading/truck-loading-detail', navigationExtras);
  }

}
