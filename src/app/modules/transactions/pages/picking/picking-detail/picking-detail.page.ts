import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { IonPopover, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MultiPickingRoot } from '../../../models/picking';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-picking-detail',
  templateUrl: './picking-detail.page.html',
  styleUrls: ['./picking-detail.page.scss'],
})
export class PickingDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: MultiPickingRoot;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    public objectService: PickingService,
    private commonService: CommonService
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/picking');
      }
    })
  }

  ionViewWillEnter(): void {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/picking')
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
        if (this.object.outstandingPickList && this.object.outstandingPickList.length > 0) {
          this.uniqueSalesOrder = [...new Set(this.object.outstandingPickList.flatMap(r => r.salesOrderNum))];
        }
      }, error => {
        throw error;
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
    let find = this.object.outstandingPickList.filter(r => r.salesOrderNum === salesOrderNum);
    if (find && find.length > 0) {
      return find;
    }
    return null;
  }

  /* #endregion */

  editObject() {
    this.objectService.object = this.object;
    this.objectService.setHeader(this.object.header);
    this.objectService.multiPickingObject = { outstandingPickList: this.object.outstandingPickList, pickingCarton: this.object.details };
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.header.multiPickingId
      }
    }
    this.navController.navigateRoot('/transactions/picking/picking-item', navigationExtras);
  }

}
