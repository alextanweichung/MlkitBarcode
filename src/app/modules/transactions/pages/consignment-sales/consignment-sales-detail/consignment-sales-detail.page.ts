import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { ConsignmentSalesRoot } from '../../../models/consignment-sales';
import { ConsignmentSalesService } from '../../../services/consignment-sales.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-consignment-sales-detail',
  templateUrl: './consignment-sales-detail.page.html',
  styleUrls: ['./consignment-sales-detail.page.scss'],
})
export class ConsignmentSalesDetailPage implements OnInit, ViewWillEnter {

  objectId: number;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public objectService: ConsignmentSalesService,
    private navController: NavController,
    private commonService: CommonService,
    private alertController: AlertController,
    private toastService: ToastService
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ionViewWillEnter(): void {
    if (this.objectId && this.objectId) {
      this.loadObject();
    }
  }

  ngOnInit() {
    this.loadModuleControl();
  }

  moduleControl: ModuleControl[] = [];
  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;
  consignmentSalesActivateMarginCalculation: boolean = false;
  loadModuleControl() {
    try {
      this.authService.moduleControlConfig$.subscribe(obj => {
        this.moduleControl = obj;
        let activateMargin = this.moduleControl.find(x => x.ctrlName === "ConsignmentSalesActivateMarginCalculation");
        if (activateMargin && activateMargin.ctrlValue.toUpperCase() == 'Y') {
          this.consignmentSalesActivateMarginCalculation = true;
        }
      })
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
        this.maxPrecision = this.precisionSales.localMax;
        this.maxPrecisionTax = this.precisionTax.localMax;
      })
    } catch (e) {
      console.error(e);
    }
  }

  loadObject() {
    try {
      if (this.objectId && this.objectId) {
        this.objectService.getObjectById(this.objectId).subscribe(response => {
          this.objectService.setHeader(response.header);
          this.objectService.setDetail(response.details);
          if (this.objectService.header.isHomeCurrency) {
            this.objectService.header.maxPrecision = this.precisionSales.localMax;
            this.objectService.header.maxPrecisionTax = this.precisionTax.localMax
          } else {
            this.objectService.header.maxPrecision = this.precisionSales.foreignMax;
            this.objectService.header.maxPrecisionTax = this.precisionTax.foreignMax;
          }
        }, error => {
          throw error;
        })
      }
    } catch (e) {
      console.error(e);
    }
  }

  edit() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.objectId
      }
    }
    this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-item', navigationExtras);
  }

  async toggleObjectAlert() {
    const alert = await this.alertController.create({
      header: "Are you sure to proceed?",
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
          text: "Cancel",
          role: "cancel",
          cssClass: "cancel",
        },
      ],
    });
    await alert.present();
  }

  completeObject() {
    if (this.objectService.header.isEntryCompleted) {
      this.objectService.unCompleteObject(this.objectId).subscribe(response => {
        if (response.status === 204) {
          this.toastService.presentToast("", "Consignment Sales updated", "top", "success", 1000);
          this.loadObject();
        }
      }, error => {
        console.error(error);
      })
    } else {
      this.objectService.completeObject(this.objectId).subscribe(response => {
        if (response.status === 204) {
          this.toastService.presentToast("", "Consignment Sales updated", "top", "success", 1000);
          this.loadObject();
        }
      }, error => {
        console.error(error);
      })
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

  /* #region download pdf */

  async presentAlertViewPdf() {
    try {
      const alert = await this.alertController.create({
        header: 'Download PDF?',
        message: '',
        buttons: [
          {
            text: 'OK',
            cssClass: 'success',
            role: 'confirm',
            handler: async () => {
              await this.downloadPdf();
            },
          },
          {
            cssClass: 'cancel',
            text: 'Cancel',
            role: 'cancel'
          },
        ]
      });
      await alert.present();
    } catch (e) {
      console.error(e);
    }
  }

  async downloadPdf() {
    try {
      this.objectService.downloadPdf("SMCS001", "pdf", this.objectService.header.consignmentSalesId, "Mobile Ticketing").subscribe(response => {
        let filename = this.objectService.header.consignmentSalesNum + ".pdf";
        this.commonService.commonDownloadPdf(response, filename);
      }, error => {
        console.log(error);
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  goBack() {
    this.objectService.resetVariables();
    this.navController.navigateBack("/transactions/consignment-sales");
  }

}
