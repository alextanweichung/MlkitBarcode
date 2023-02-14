import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, NavController, ViewDidEnter } from '@ionic/angular';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { TruckLoadingHeader } from '../../models/truck-loading';
import { TruckLoadingService } from '../../services/truck-loading.service';

@Component({
  selector: 'app-truck-loading',
  templateUrl: './truck-loading.page.html',
  styleUrls: ['./truck-loading.page.scss'],
})
export class TruckLoadingPage implements OnInit, ViewDidEnter {

  objects: TruckLoadingHeader[] = [];

  constructor(
    private objectService: TruckLoadingService,
    private actionSheetController: ActionSheetController,
    private navController: NavController
  ) { }

  ionViewDidEnter(): void {
    this.loadObjects();
  }

  ngOnInit() {
    this.loadMasterList();
  }

  loadObjects() {
    this.objectService.getObjects().subscribe(response => {
      this.objects = response;
    }, error => {
      console.log(error);
    })
  }

  shipMethodMasterList: MasterListDetails[] = [];
  vendorMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.shipMethodMasterList = response.filter(x => x.objectName == 'ShipMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.vendorMasterList = response.filter(x => x.objectName == 'Vendor').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  /* #region  add object */

  async addObject() {    
    this.navController.navigateForward('/transactions/truck-loading/truck-loading-add');
  }

  // Select action
  async selectAction() {
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
