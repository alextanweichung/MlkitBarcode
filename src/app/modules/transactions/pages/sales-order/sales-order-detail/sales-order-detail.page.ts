import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController, ViewWillEnter } from '@ionic/angular';
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
import { DraftTransactionService } from 'src/app/shared/services/draft-transaction.service';
import { DraftTransaction } from 'src/app/shared/models/draft-transaction';

@Component({
  selector: 'app-sales-order-detail',
  templateUrl: './sales-order-detail.page.html',
  styleUrls: ['./sales-order-detail.page.scss']
})
export class SalesOrderDetailPage implements OnInit, ViewWillEnter {

  objectId: any;
  object: SalesOrderRoot;
  processType: string;
  selectedSegment: string;

  isDraft: boolean = false;
  draftTransactionId: number;
  draftObject: DraftTransaction;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: SalesOrderService,
    private draftObjectService: DraftTransactionService,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
        this.processType = params['processType'];
        this.selectedSegment = params['selectedSegment'];

        this.isDraft = params['isDraft'];
        console.log("🚀 ~ file: sales-order-detail.page.ts:47 ~ SalesOrderDetailPage ~ this.isDraft:", this.isDraft)
        if (this.isDraft) {
          this.draftTransactionId = params['draftTransactionId'];
          console.log("🚀 ~ file: sales-order-detail.page.ts:50 ~ SalesOrderDetailPage ~ this.draftTransactionId:", this.draftTransactionId)
        }
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
    } else if (this.isDraft && this.draftTransactionId && this.draftTransactionId > 0) {
      this.loadDraftObject();
    } else {
      this.toastService.presentToast('', 'Invalid Sales Order.', 'top', 'warning', 1000);
      this.navController.navigateBack('/transactions/sales-order');
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
        if (this.object.header.isHomeCurrency) {
          this.object.header.maxPrecision = this.precisionSales.localMax;
          this.object.header.maxPrecisionTax = this.precisionTax.localMax
        } else {
          this.object.header.maxPrecision = this.precisionSales.foreignMax;
          this.object.header.maxPrecisionTax = this.precisionTax.foreignMax;
        }
        this.loadWorkflow(this.object.header.salesOrderId);
        this.objectService.setHeader(this.object.header);
        this.objectService.setChoosenItems(this.object.details);
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error', 'Sales Order', 'top', 'danger', 1000);
    }
  }

  workFlowState: WorkFlowState[] = [];
  trxChild: TrxChild[] = [];
  loadWorkflow(objectId: number) {
    this.workFlowState = [];
    this.objectService.getWorkflow(objectId).subscribe(response => {
      this.workFlowState = response;

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
        }
      }, error => {
        console.log(error);
      });
    }, error => {
      console.error(error);
    })
  }

  loadDraftObject() {
    this.draftObjectService.getObject(this.draftTransactionId).subscribe(response => {
      this.draftObject = response;
      this.object = JSON.parse(this.draftObject.jsonData) as SalesOrderRoot;
      this.object.header.salesOrderNum = this.draftObject.draftTransactionNum;
      this.isDraft = true;
      this.objectService.setHeader(this.object.header);
      this.objectService.setChoosenItems(this.object.details);
      this.objectService.setDraftObject(this.draftObject);
    }, error => {
      console.error(error);
    })
  }

  editObject() {
    this.objectService.setHeader(this.object.header);
    this.objectService.setChoosenItems(this.object.details);
    if (this.isDraft) {
      this.objectService.setDraftObject(this.draftObject);
    }
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.header.salesOrderId
      }
    }
    this.navController.navigateRoot('/transactions/sales-order/sales-order-cart', navigationExtras);
  }

  toggleObject() {
    this.objectService.toggleObject(this.object.header.salesOrderId).subscribe(response => {
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

  async presentApprovalAlert(action: string) {
    try {
      if (this.processType && this.selectedSegment) {
        const alert = await this.alertController.create({
          cssClass: 'custom-alert',
          backdropDismiss: false,
          header: 'Are you sure to ' + action + ' ' + this.object.header.salesOrderNum + '?',
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
                workflowApiObject = "MobileSalesOrderReview";
                break;
              case "APPROVAL":
                workflowApiObject = "MobileSalesOrderApprove";
                break;
              case "PRICINGAPPROVAL":
                workflowApiObject = "MobilePricingApprove";
                break;
              default:
                this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                return;
            }
          }
          if (action.toUpperCase() === "REVERSE") {
            switch (this.currentWorkflow.stateType.toUpperCase()) {
              case "REVIEW":
                workflowApiObject = "MobileSalesOrderReview";
                break;
              case "APPROVAL":
                workflowApiObject = "MobileSalesOrderApprove";
                break;
              case "PRICINGAPPROVAL":
                workflowApiObject = "MobilePricingApprove";
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

  /* #region from draft to confirm so */

  async presentConfirmAlert() {
    try {
      if (this.objectService.itemInCart.length > 0) {
        const alert = await this.alertController.create({
          header: "Are you sure to proceed?",
          subHeader: "This will delete Draft & Generate SO",
          buttons: [
            {
              text: 'OK',
              cssClass: 'success',
              role: 'confirm',
              handler: async () => {
                  await this.insertObject();
              },
            },
            {
              text: 'Cancel',
              cssClass: 'cancel',
              role: 'cancel'
            },
          ],
        });
        await alert.present();
      } else {
        this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'top', 'danger', 1000);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async insertObject() {
    try {
      let trxDto: SalesOrderRoot = {
        header: this.objectService.header,
        details: this.objectService.itemInCart
      }
      trxDto = this.checkPricingApprovalLines(trxDto, trxDto.details);
      trxDto.header.salesOrderNum = null; // always default to null when insert
      if (this.objectService.draftObject && this.objectService.draftObject.draftTransactionId > 0) {
        this.draftObjectService.toggleObject(this.objectService.draftObject.draftTransactionId).subscribe(response => {
          if (response.status === 204) {

          }
        }, error => {
          console.error(error);
        })
      }
      this.objectService.insertObject(trxDto).subscribe(response => {
        this.objectService.setObject((response.body as SalesOrderRoot));
        this.toastService.presentToast('Insert Complete', '', 'top', 'success', 1000);
        this.navController.navigateRoot('/transactions/sales-order/sales-order-summary');
      }, error => {
        throw error;
      });
    } catch (e) {
      console.error(e);
    }
  }

  checkPricingApprovalLines(trxDto: SalesOrderRoot, trxLineArray: TransactionDetail[]) {
    let filteredData = trxLineArray.filter(x => x.unitPrice != x.oriUnitPrice || x.unitPriceExTax != x.oriUnitPriceExTax || x.discountGroupCode != x.oriDiscountGroupCode || x.discountExpression != x.oriDiscountExpression);
    filteredData = filteredData.filter(x => !x.isPromoImpactApplied);
    if (filteredData.length > 0) {
      filteredData.forEach(x => { x.isPricingApproval = true });
      trxDto.header.isPricingApproval = true;
    } else {
      trxDto.header.isPricingApproval = false;
    }
    return trxDto;
  }

  /* #endregion */

}
