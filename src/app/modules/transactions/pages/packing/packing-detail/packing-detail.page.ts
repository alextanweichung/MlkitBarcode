import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { IonPopover, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MultiPackingRoot } from '../../../models/packing';
import { ConfigService } from 'src/app/services/config/config.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-packing-detail',
  templateUrl: './packing-detail.page.html',
  styleUrls: ['./packing-detail.page.scss'],
})
export class PackingDetailPage implements OnInit,ViewWillEnter {

  objectId: number;
  object: MultiPackingRoot;
  isMobile: boolean = true;
 

  constructor(
    public objectService: PackingService,
    public configService: ConfigService,
    private commonService: CommonService,
    private toastService: ToastService,
    private navController: NavController,
    private modalController: ModalController,
    private route: ActivatedRoute,
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/packing');
      }
    })
  }

  ionViewWillEnter(): void {
    this.isMobile = Capacitor.getPlatform() !== "web";
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/packing')
    } else {
      this.loadDetail();
    }
  }

  ngOnInit() {

  }

  uniqueSalesOrder: string[] = [];
  loadDetail() {
    this.uniqueSalesOrder = []
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
        this.object.header = this.commonService.convertObjectAllDateType(this.object.header);
        if (this.object.outstandingPackList && this.object.outstandingPackList.length > 0) {
          this.uniqueSalesOrder = [...new Set(this.object.outstandingPackList.flatMap(r => r.salesOrderNum))];
        }
      }, error => {
        console.error(error);
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region find outstanding item in this SO */

  getItemOfSO(salesOrderNum: string) {
    let find = this.object.outstandingPackList.filter(r => r.salesOrderNum === salesOrderNum);
    if (find && find.length > 0) {
      return find;
    }
    return null;
  }


  lookupItemInfo(itemId: number, lookupInfoType: string) {
    if (lookupInfoType == "CODE" && Capacitor.getPlatform() !== "web") {
      let findItem = this.configService.item_Masters.find(x => x.id == itemId);
      if (findItem) {
        return findItem.code;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /* #endregion */


  editObject() {
    this.objectService.object = this.object;
    this.objectService.setHeader(this.object.header);
    this.objectService.multiPackingObject = { outstandingPackList: this.object.outstandingPackList, packingCarton: this.object.details };
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.header.multiPackingId
      }
    }
    this.navController.navigateRoot('/transactions/packing/packing-item', navigationExtras);
  }
}
