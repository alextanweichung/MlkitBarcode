import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { SalesOrderRoot } from '../../../models/sales-order';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { CommonService } from 'src/app/shared/services/common.service';
import { SalesOrderStatus } from 'src/app/shared/models/sales-order-status';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';

@Component({
  selector: 'app-sales-order-detail',
  templateUrl: './sales-order-detail.page.html',
  styleUrls: ['./sales-order-detail.page.scss']
})
export class SalesOrderDetailPage implements OnInit {

  objectId: number
  object: SalesOrderRoot;
  processType: string;
  selectedSegment: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    private salesOrderService: SalesOrderService,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
        this.processType = params['processType'];
        this.selectedSegment = params['selectedSegment'];
        if (!this.objectId) {
          this.navController.navigateBack('/transactions/sales-order');
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/sales-order')
    } else {
      this.loadModuleControl();
      this.loadMasterList();
      this.loadObject();
    }
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

  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.salesOrderService.getMasterList().subscribe(response => {
        this.locationMasterList = response.filter(x => x.objectName == 'Location').flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationXMasterList = response.filter(x => x.objectName == "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated == 0);
        this.itemVariationYMasterList = response.filter(x => x.objectName == "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated == 0);
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading master list', '', 'top', 'danger', 1000);
    }
  }

  loadObject() {
    try {
      this.salesOrderService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  matchImage(itemId: number) {
    try {
      let defaultImageUrl = "assets/icon/favicon.png";
      // let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
      // if (lookup) {
      //   return "data:image/png;base64, " + lookup;
      // }
      return defaultImageUrl;
    } catch (e) {
      console.error(e);
    }
  }

  filter(details: InnerVariationDetail[]) {
    try {
      return details.filter(r => r.qtyRequest > 0);
    } catch (e) {
      console.error(e);
    }
  }

  /* #region show variaton dialog */

  selectedItem: TransactionDetail;
  showDetails(item: TransactionDetail) {
    if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
      this.object.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
      item.isSelected = !item.isSelected;
    }
  }
  
  /* #endregion */

  /* #region history modal */

  historyModal: boolean = false;
  showHistoryModal() {
    this.historyModal = true;
  }

  hideHistoryModal() {
    this.historyModal = false;
  }

  /* #endregion */

  /* #region download pdf */

  async presentAlertViewPdf() {
    try {
      const alert = await this.alertController.create({
        header: '',
        subHeader: 'View Pdf?',
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
      this.salesOrderService.downloadPdf("SMSC002", "pdf", this.object.header.salesOrderId).subscribe(response => {
        let filename = this.object.header.salesOrderNum + ".pdf";
        this.commonService.commonDownloadPdf(response, filename);
      }, error => {
        console.log(error);
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

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

  /* #region approve reject */

  async presentConfirmAlert(action: string) {
    try {
      if (this.processType && this.selectedSegment) {
        const alert = await this.alertController.create({
          cssClass: 'custom-alert',
          backdropDismiss: false,
          header: 'Are you sure to ' + action + ' ' + this.object.header.salesOrderId + '?',
          inputs: [
            {
              name: 'actionreason',
              type: 'textarea',
              placeholder: 'Please enter Reason',
              value: ''
            }
          ],
          buttons: [
            {
              text: 'OK',
              role: 'confirm',
              cssClass: 'success',
              handler: (data) => {
                if (action === 'REJECT' && this.processType) {
                  if (!data.actionreason && data.actionreason.length === 0) {
                    this.toastService.presentToast('Please enter reason', '', 'top', 'danger', 1000);
                    return false;
                  } else {
                    this.updateDoc(action, [this.object.header.salesOrderId.toString()], data.actionreason);
                  }
                } else {
                  this.updateDoc(action, [this.object.header.salesOrderId.toString()], data.actionreason);
                }
              },
            },
            {
              text: 'Cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } else {
        this.toastService.presentToast('System Error', 'Something went wrong, please contact Adminstrator', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  updateDoc(action: string, listOfDoc: string[], actionReason: string) {
    try {
      if (this.processType && this.selectedSegment) {
        let bulkConfirmReverse: BulkConfirmReverse = {
          status: action,
          reason: actionReason,
          docId: listOfDoc.map(i => Number(i))
        }
        try {
          this.salesOrderService.bulkUpdateDocumentStatus(this.processType === 'REVIEWS' ? 'mobileSalesOrderReview' : 'mobileSalesOrderApprove', bulkConfirmReverse).subscribe(async response => {
            if (response.status == 204) {
              this.toastService.presentToast("Doc review is completed.", "", "top", "success", 1000);
              this.navController.back();
            }
          }, error => {
            throw Error;
          })
        } catch (error) {
          this.toastService.presentToast('Update error', '', 'top', 'danger', 1000);
        }
      } else {
        this.toastService.presentToast('System Error', 'Something went wrong, please contact Adminstrator', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  /* #region order status */

  statusModel: boolean = false;
  orderStatus: SalesOrderStatus;
  showStatusModel() {
    try {

    } catch (e) {
      console.error(e);
    }
    this.statusModel = true;
    this.salesOrderService.getStatus(this.object.header.salesOrderId).subscribe(response => {
    this.orderStatus = response;

    }, error => {
      throw error;
    })
  }

  hideStatusModel() {
    this.statusModel = false;
  }

  /* #endregion */

}
