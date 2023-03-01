import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AlertController, IonPopover, LoadingController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PurchaseOrderLine, PurchaseOrderRoot } from '../../../models/purchase-order';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { Capacitor } from '@capacitor/core';
import { BulkConfirmReverse } from 'src/app/shared/models/transaction-processing';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';

@Component({
  selector: 'app-purchase-order-detail',
  templateUrl: './purchase-order-detail.page.html',
  styleUrls: ['./purchase-order-detail.page.scss'],
  providers: [File, FileOpener, AndroidPermissions]
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
    private loadingController: LoadingController,
    private androidPermissions: AndroidPermissions,
    private opener: FileOpener,
    private file: File,
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
    const loading = await this.loadingController.create({
      cssClass: 'default-loading',
      message: '<p>Downloading...</p><span>Please be patient.</span>',
      spinner: 'crescent'
    });
    this.purchaseOrderService.downloadPdf("IMPC002", "pdf", this.object.header.purchaseOrderId).subscribe(response => {
      let filename = this.object.header.purchaseOrderNum + ".pdf";
      if (Capacitor.getPlatform() === 'android') {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
          async result => {
            if (!result.hasPermission) {
              this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                async result => {
                  await loading.present();
                  this.file.writeFile(this.file.externalRootDirectory + "/Download", filename, response, { replace: true }).then(() => {
                    this.opener.open(this.file.externalRootDirectory + "/Download/" + filename, "application/pdf");
                    loading.dismiss();
                  }).catch((Error) => {
                    loading.dismiss();
                  });
                }
              );
            } else {
              await loading.present();
              this.file.writeFile(this.file.externalRootDirectory + "/Download", filename, response, { replace: true }).then(() => {
                this.opener.open(this.file.externalRootDirectory + "/Download/" + filename, "application/pdf");
                loading.dismiss();
              }).catch((Error) => {
                loading.dismiss();
              });
            }
          }
        )
      } else if (Capacitor.getPlatform() === 'ios') {
        this.file.writeFile(this.file.tempDirectory, filename, response, { replace: true }).then(() => {
          this.opener.open(this.file.tempDirectory + filename, "application/pdf");
          loading.dismiss();
        }).catch((error) => {
          loading.dismiss();
        })
      } else {
        const url = window.URL.createObjectURL(response);
        const link = window.document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        window.document.body.appendChild(link);
        link.click();
        link.remove();
      }
    }, error => {
      loading.dismiss();
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
