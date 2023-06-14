import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { QuotationRoot } from '../../../models/quotation';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { TrxChild } from 'src/app/shared/models/trx-child';

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.page.html',
  styleUrls: ['./quotation-detail.page.scss']
})
export class QuotationDetailPage implements OnInit {

  objectId: number
  object: QuotationRoot;
  processType: string;
  selectedSegment: string;

  constructor(
    private authService: AuthService,
    public objectService: QuotationService,
    private toastService: ToastService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private navController: NavController,
    private alertController: AlertController
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
        this.processType = params['processType'];
        this.selectedSegment = params['selectedSegment'];
        if (!this.objectId) {
          this.navController.navigateBack('/transactions/quotation');
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    try {
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/quotation')
      } else {
        this.loadModuleControl();
        this.loadObject();
      }
    } catch (e) {
      console.error(e);
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
        this.object = response;
        this.loadWorkflow(this.object.header.quotationId);
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
      if (response) {
        this.workFlowState = response;
      } else {
        this.workFlowState = [];
      }
    }, error => {
      console.error(error);
    })
  }

  editObject() {
    this.objectService.setHeader(this.object.header);
    this.objectService.setChoosenItems(this.object.details);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.header.quotationId
      }
    }
    this.navController.navigateRoot('/transactions/quotation/quotation-cart', navigationExtras);
  }

  toggleObject() {
    this.objectService.toggleObject(this.object.header.quotationId).subscribe(response => {
      if (response.status === 204) {
        this.loadObject();
        this.toastService.presentToast("Update Complete", "", "top", "success", 1000);
      }
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
    try {
      this.historyModal = true;
    } catch (e) {
      console.error(e);
    }
  }

  hideHistoryModal() {
    try {
      this.historyModal = false;
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
      this.objectService.downloadPdf("SMSC001", "pdf", this.object.header.quotationId).subscribe(response => {
        let filename = this.object.header.quotationNum + ".pdf";
        this.commonService.commonDownloadPdf(response, filename);
      }, error => {
        throw error;
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
          header: 'Are you sure to ' + action + ' ' + this.object.header.quotationNum + '?',
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
                    this.updateDoc(action, [this.object.header.quotationId.toString()], data.actionreason);
                  }
                } else {
                  this.updateDoc(action, [this.object.header.quotationId.toString()], data.actionreason);
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

  currentWorkflow: WorkFlowState;
  nextWorkflow: WorkFlowState;
  updateDoc(action: string, listOfDoc: string[], actionReason: string) {
    try {
      if (this.processType && this.selectedSegment) {
        let bulkConfirmReverse: BulkConfirmReverse = {
          status: action,
          reason: actionReason,
          docId: listOfDoc.map(i => Number(i))
        }
        try {
          this.currentWorkflow = this.workFlowState[this.workFlowState.filter(r => r.isCompleted).length - 1];
          this.nextWorkflow = this.workFlowState.find(r => r.trxId === null);
          let workflowApiObject: string;
          if (action.toUpperCase() === "CONFIRM" || action.toUpperCase() === "REJECT") {
            switch (this.nextWorkflow.stateType.toUpperCase()) {
              case "REVIEW":
                workflowApiObject = "MobileQuotationReview";
                break;
              case "APPROVAL":
                workflowApiObject = "MobileQuotationApprove";
                break;
              default:
                this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                return;
            }
          }
          if (action.toUpperCase() === "REVERSE") {
            switch (this.currentWorkflow.stateType.toUpperCase()) {
              case "REVIEW":
                workflowApiObject = "MobileQuotationReview";
                break;
              case "APPROVAL":
                workflowApiObject = "MobileQuotationApprove";
                break;
              default:
                this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                return;
            }
          }
          this.objectService.bulkUpdateDocumentStatus(workflowApiObject, bulkConfirmReverse).subscribe(async response => {
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

}
