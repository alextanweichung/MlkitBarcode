import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, IonPopover, LoadingController, NavController } from '@ionic/angular';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { InnerVariationDetail } from 'src/app/shared/models/variation-detail';
import { QuotationRoot } from '../../../models/quotation';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.page.html',
  styleUrls: ['./quotation-detail.page.scss'],
  providers: [File, FileOpener, AndroidPermissions]
})
export class QuotationDetailPage implements OnInit {

  objectId: number
  object: QuotationRoot;

  constructor(
    private authService: AuthService,
    private quotationService: QuotationService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private navController: NavController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private androidPermissions: AndroidPermissions,    
    private opener: FileOpener,
    private file: File,
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
      if (!this.objectId) {
        this.navController.navigateBack('/transactions/quotation');
      }
    })
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/quotation')
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
    } catch (error) {
      this.toastService.presentToast('Error loading module control', '', 'top', 'danger', 1000);
    }
  }

  locationMasterList: MasterListDetails[] = [];
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    try {
      this.quotationService.getMasterList().subscribe(response => {
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
      this.quotationService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  matchImage(itemId: number) {
    let defaultImageUrl = "assets/icon/favicon.png";
    // let lookup = this.availableImages.find(r => r.keyId === itemId)?.imageSource;
    // if (lookup) {
    //   return "data:image/png;base64, " + lookup;
    // }
    return defaultImageUrl;
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
    this.quotationService.downloadPdf("SMSC001", "pdf", this.object.header.quotationId).subscribe(response => {
      let filename = this.object.header.quotationNum  + ".pdf";
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

}
