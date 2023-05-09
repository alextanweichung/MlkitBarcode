import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { SalesOrderService } from 'src/app/modules/transactions/services/sales-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { SalesOrderRoot } from '../../../models/sales-order';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { TrxChild } from 'src/app/shared/models/trx-child';

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
    public objectService: SalesOrderService,
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

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        console.log("🚀 ~ file: sales-order-detail.page.ts:77 ~ SalesOrderDetailPage ~ this.objectService.getObjectById ~ response:", response)
        this.object = response;
        this.loadWorkflow(this.object.header.salesOrderId);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  workFlowState: WorkFlowState[] = [];
  trxChild: TrxChild[] = [];
  loadWorkflow(objectId: number) {
    this.workFlowState = [];
    this.objectService.getWorkflow(objectId).subscribe(response => {
      this.workFlowState = response;
      console.log("🚀 ~ file: sales-order-detail.page.ts:95 ~ SalesOrderDetailPage ~ this.objectService.getWorkflow ~ this.workFlowState:", this.workFlowState)

      this.objectService.getTrxChild(objectId).subscribe(response2 => {
        this.trxChild = response2;
        if (this.trxChild.length > 0) {
          let trxTypes: string[] = this.trxChild.map(x => x.serviceName);
          trxTypes = [...new Set(trxTypes)];
          trxTypes.forEach(type => {
            let relatedArray = this.trxChild.filter(x => x.serviceName == type);
            let trxIds = relatedArray.map(x => x.trxId);
            let trxNums = relatedArray.map(x => x.trxNum);
            let trxDates = relatedArray.map(x => x.trxDate);
            let routerLinks = relatedArray.map(x => x.routerLink);
            if (type == 'SalesInvoice') {
              type = 'Sales Invoice';
            }
            let newState: WorkFlowState = {
              stateId: null,
              title: type,
              trxId: null,
              trxIds: trxIds,
              trxNum: null,
              trxNums: trxNums,
              trxDate: null,
              trxDates: trxDates,
              trxBy: null,
              routerLink: null,
              routerLinks: routerLinks,
              icon: 'pi pi-star-fill',
              stateType: 'TRANSACTION',
              isCompleted: true,
              sequence: null,
              interval: null
            }
            this.workFlowState = [...this.workFlowState, newState]
          })
          console.log("🚀 ~ file: sales-order-detail.page.ts:130 ~ SalesOrderDetailPage ~ this.objectService.getTrxChild ~ this.workFlowState:", this.workFlowState)
        }
      }, error => {
        console.log(error);
      });
    }, error => {
      console.error(error);
    })
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

  async presentAlertViewPdf(reportName: string) {
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
              await this.downloadPdf(reportName);
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

  async downloadPdf(reportName: string) {
    try {
      this.objectService.downloadPdf("SMSC002", "pdf", this.object.header.salesOrderId, reportName).subscribe(response => {
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
          this.objectService.bulkUpdateDocumentStatus(this.processType === 'REVIEWS' ? 'mobileSalesOrderReview' : 'mobileSalesOrderApprove', bulkConfirmReverse).subscribe(async response => {
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

  showStatus() {
    try {
      this.objectService.getStatus(this.object.header.salesOrderId).subscribe(response => {
        this.toastService.presentToast('Doc Status', response.currentStatus, 'top', 'success', 2000);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
