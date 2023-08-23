import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { InboundScanRoot } from '../../../models/inbound-scan';
import { InboundScanService } from '../../../services/inbound-scan.service';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-inbound-scan-detail',
  templateUrl: './inbound-scan-detail.page.html',
  styleUrls: ['./inbound-scan-detail.page.scss'],
})
export class InboundScanDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: InboundScanRoot;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private modalController: ModalController,
    private toastService: ToastService,
    public objectService: InboundScanService,
    private commonService: CommonService
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/inbound-scan');
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

  // uniqueSalesOrder: string[] = [];
  loadDetail() {
    // this.uniqueSalesOrder = []
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        console.log("🚀 ~ file: inbound-scan-detail.page.ts:51 ~ InboundScanDetailPage ~ this.objectService.getObjectById ~ response:", response)
        this.object = response;
        this.object.header = this.commonService.convertObjectAllDateType(this.object.header);
        // if (this.object.outstandingPickList && this.object.outstandingPickList.length > 0) {
        //   this.uniqueSalesOrder = [...new Set(this.object.outstandingPickList.flatMap(r => r.salesOrderNum))];
        // }
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

}
