import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PurchaseOrderLine, PurchaseOrderRoot } from '../../../models/purchase-order';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { Capacitor } from '@capacitor/core';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-purchase-order-detail',
  templateUrl: './purchase-order-detail.page.html',
  styleUrls: ['./purchase-order-detail.page.scss']
})
export class PurchaseOrderDetailPage implements OnInit {

  parent: string = 'Purchase Order'

  objectId: number;
  object: PurchaseOrderRoot;
  flattenPurchaseOrder: any;
  processType: string;
  selectedSegment: string;

  constructor(
    private route: ActivatedRoute,
    private navController: NavController,
    private toastService: ToastService,
    private purchaseOrderService: PurchaseOrderService,
    private alertController: AlertController,
    private commonService: CommonService,
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      this.processType = params['processType'];
      this.selectedSegment = params['selectedSegment'];
      if (params['parent']) {
        this.parent = params['parent'];
      }
    })
  }

  ngOnInit() {
    if (!this.objectId) {
      this.toastService.presentToast('Something went wrong!', '', 'top', 'danger', 1000);
      this.navController.navigateBack('/transactions')
    } else {
      this.loadMasterList();
      this.loadDetail();
    }
  }

  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.purchaseOrderService.getMasterList().subscribe(response => {
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

  loadDetail() {
    try {
      this.purchaseOrderService.getPurchaseOrderDetail(this.objectId).subscribe(response => {
        this.object = response;
        this.flattenPurchaseOrder = this.purchaseOrderService.unflattenDtoDetail(this.object);
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  getFlattenVariations(itemId: number): PurchaseOrderLine[] {
    return this.flattenPurchaseOrder.details.filter(r => r.itemId === itemId);
  }

  filter(details: InnerVariationDetail[]) {
    return details.filter(r => r.qtyRequest > 0);
  }

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
  }

  async downloadPdf() {
    this.purchaseOrderService.downloadPdf("IMPC002", "pdf", this.object.header.purchaseOrderId).subscribe(response => {
      let filename = this.object.header.purchaseOrderNum + ".pdf";
      this.commonService.commonDownloadPdf(response, filename);
    }, error => {
      console.log(error);
    })
  }

  /* #endregion */

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    this.popoverMenu.event = event;
    this.isPopoverOpen = true;
  }

  /* #endregion */

  /* #region approve reject */

  async presentConfirmAlert(action: string) {
    if (this.processType && this.selectedSegment) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        backdropDismiss: false,
        header: 'Are you sure to ' + action + ' ' + this.object.header.purchaseOrderNum + '?',
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
                  this.updateDoc(action, [this.object.header.purchaseOrderId.toString()], data.actionreason);
                }
              } else {
                this.updateDoc(action, [this.object.header.purchaseOrderId.toString()], data.actionreason);
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
  }

  updateDoc(action: string, listOfDoc: string[], actionReason: string) {
    if (this.processType && this.selectedSegment) {
      let bulkConfirmReverse: BulkConfirmReverse = {
        status: action,
        reason: actionReason,
        docId: listOfDoc.map(i => Number(i))
      }
      try {
        this.purchaseOrderService.bulkUpdateDocumentStatus(this.processType === 'REVIEWS' ? 'mobilePurchaseOrderReview' : 'mobilePurchaseOrderApprove', bulkConfirmReverse).subscribe(async response => {
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
  }

  /* #endregion */

}
