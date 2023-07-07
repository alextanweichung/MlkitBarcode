import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { BackToBackOrderRoot } from 'src/app/modules/transactions/models/backtoback-order';
import { BackToBackOrderService } from 'src/app/modules/transactions/services/backtoback-order.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { TrxChild } from 'src/app/shared/models/trx-child';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { WorkFlowState } from 'src/app/shared/models/workflow';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-backtoback-order-detail',
  templateUrl: './backtoback-order-detail.page.html',
  styleUrls: ['./backtoback-order-detail.page.scss'],
})
export class BacktobackOrderDetailPage implements OnInit {

  objectId: number
  object: BackToBackOrderRoot;
  processType: string;
  selectedSegment: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: BackToBackOrderService,
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
          this.navController.navigateBack('/transactions/backtoback-order');
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/backtoback-order')
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
        this.object = response;
        if (this.object.header.isHomeCurrency) {
          this.object.header.maxPrecision = this.precisionSales.localMax;
          this.object.header.maxPrecisionTax = this.precisionTax.localMax
        } else {
          this.object.header.maxPrecision = this.precisionSales.foreignMax;
          this.object.header.maxPrecisionTax = this.precisionTax.foreignMax;
        }
        this.loadWorkflow(this.object.header.backToBackOrderId);
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

  editObject() {
    this.objectService.setHeader(this.object.header);
    this.objectService.setChoosenItems(this.object.details);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.header.backToBackOrderId
      }
    }
    this.navController.navigateRoot('/transactions/backtoback-order/backtoback-order-cart', navigationExtras);
  }

  toggleObject() {
    this.objectService.toggleObject(this.object.header.backToBackOrderId).subscribe(response => {
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
          header: 'Are you sure to ' + action + ' ' + this.object.header.backToBackOrderNum + '?',
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
                    this.updateDoc(action, [this.object.header.backToBackOrderId.toString()], data.actionreason);
                  }
                } else {
                  this.updateDoc(action, [this.object.header.backToBackOrderId.toString()], data.actionreason);
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
                workflowApiObject = "MobileBackToBackOrderReview";
                break;
              case "APPROVAL":
                workflowApiObject = "MobileBackToBackOrderApprove";
                break;
              case "PRICINGAPPROVAL":
                workflowApiObject = "MobileBackToBackOrderPricingApprove";
                break;
              default:
                this.toastService.presentToast("System Error", "Workflow not found.", "top", "danger", 1000);
                return;
            }
          }
          if (action.toUpperCase() === "REVERSE") {
            switch (this.currentWorkflow.stateType.toUpperCase()) {
              case "REVIEW":
                workflowApiObject = "MobileBackToBackOrderReview";
                break;
              case "APPROVAL":
                workflowApiObject = "MobileBackToBackOrderApprove";
                break;
              case "PRICINGAPPROVAL":
                workflowApiObject = "MobileBackToBackOrderPricingApprove";
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
