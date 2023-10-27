import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewWillEnter, NavController, AlertController, IonPopover, ActionSheetController } from '@ionic/angular';
import { StockReorderLine, StockReorderRoot } from 'src/app/modules/transactions/models/stock-reorder';
import { StockReorderService } from 'src/app/modules/transactions/services/stock-reorder.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-stock-reorder-detail',
  templateUrl: './stock-reorder-detail.page.html',
  styleUrls: ['./stock-reorder-detail.page.scss'],
})
export class StockReorderDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: StockReorderRoot;
  
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: StockReorderService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
      })
    } catch (e) {
      console.error(e);
    }
  }

  ionViewWillEnter(): void {

  }

  ngOnInit() {
    if (this.objectId && this.objectId > 0) {
      this.loadObject();
    } else {
      this.toastService.presentToast('', 'Invalid Stock Reorder.', 'top', 'warning', 1000);
      this.navController.navigateBack('/transactions/stock-reorder');
    }
    this.loadModuleControl();
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  loadModuleControl() {
    try {
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading module control', '', 'top', 'danger', 1000);
    }
  }

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
        // this.loadWorkflow(this.object.header.salesOrderId);
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error', 'Stock Reorder', 'top', 'danger', 1000);
    }
  }

  async completeObjectAlert() {
    const alert = await this.alertController.create({
      header: 'Are you sure to proceed?',
      cssClass: "custom-action-sheet",
      buttons: [
        {
          text: "Yes",
          role: "confirm",
          cssClass: "success",
          handler: async () => {
            this.completeObject();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  completeObject() {
    this.objectService.completeObject(this.objectId).subscribe(response => {
      if (response.status === 204) {
        this.toastService.presentToast("", "Sales Order generated", "top", "success", 1000);
        this.loadObject();
      }
    }, error => {
      console.error(error);
    })
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

  filter(details: StockReorderLine[]) {
    try {
      return details.filter(r => r.lineQty > 0);
    } catch (e) {
      console.error(e);
    }
  }
  
}
