import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { ConsignmentSalesRoot } from '../../../models/consignment-sales';
import { ConsignmentSalesService } from '../../../services/consignment-sales.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-consignment-sales-detail',
  templateUrl: './consignment-sales-detail.page.html',
  styleUrls: ['./consignment-sales-detail.page.scss'],
})
export class ConsignmentSalesDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: ConsignmentSalesRoot;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public objectService: ConsignmentSalesService,
    private navController: NavController,
    private commonService: CommonService,
    private alertController: AlertController
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ionViewWillEnter(): void {
    if (this.objectId) {
      this.loadObject();
    }
  }

  ngOnInit() {
    this.loadModuleControl();
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;
  loadModuleControl() {
    try {
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
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
        if (this.object.header.isHomeCurrency) {
          this.object.header.maxPrecision = this.precisionSales.localMax;
          this.object.header.maxPrecisionTax = this.precisionTax.localMax
        } else {
          this.object.header.maxPrecision = this.precisionSales.foreignMax;
          this.object.header.maxPrecisionTax = this.precisionTax.foreignMax;
        }
      }, error => {
        throw error;
      })
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
    this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-item-edit', navigationExtras);
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
      this.objectService.downloadPdf("SMCS001", "pdf", this.object.header.consignmentSalesId, "Mobile Ticketing").subscribe(response => {
        let filename = this.object.header.consignmentSalesNum + ".pdf";
        this.commonService.commonDownloadPdf(response, filename);
      }, error => {
        console.log(error);
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
