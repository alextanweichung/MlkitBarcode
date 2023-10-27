import { Component, OnInit, ViewChild } from '@angular/core';
import { TransferInScanningService } from '../../../services/transfer-in-scanning.service';
import { TransferInScanningRoot } from '../../../models/transfer-in-scanning';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ViewWillEnter, NavController, ActionSheetController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-transfer-in-scanning-detail',
  templateUrl: './transfer-in-scanning-detail.page.html',
  styleUrls: ['./transfer-in-scanning-detail.page.scss'],
})
export class TransferInScanningDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: TransferInScanningRoot;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: TransferInScanningService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params["objectId"];
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
    } else {
      this.toastService.presentToast("", "Invalid Transfer In Scanning", "top", "warning", 1000);
      this.navController.navigateBack("/transactions/transfer-in-scanning");
    }
  }

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        console.error(error);;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast("", "Invalid Transfer In Scanning", "top", "danger", 1000);
    }
  }

  async completeObjectAlert() {
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

  async undoObjectAlert() {
    const alert = await this.alertController.create({
      header: "Are you sure to proceed?",
      cssClass: "custom-action-sheet",
      buttons: [
        {
          text: "Yes",
          role: "confirm",
          cssClass: "success",
          handler: async () => {
            this.undoObject();
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
    this.objectService.completeObject(this.objectId).subscribe(response => {
      if (response.status === 204) {
        this.toastService.presentToast("", "Transfer Adjustment generated", "top", "success", 1000);
        this.loadObject();
      }
    }, error => {
      console.error(error);
    })
  }

  undoObject() {
    this.objectService.undoObject(this.objectId).subscribe(response => {
      if (response.status === 204) {
        this.toastService.presentToast("", "Transfer Adjustment undo", "top", "success", 1000);
        this.loadObject();
      }
    }, error => {
      console.error(error);
    })
  }

  editObject() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.object.transferInScanningId
      }
    }
    this.navController.navigateRoot("/transactions/transfer-in-scanning/transfer-in-scanning-edit", navigationExtras);
  }

  /* #region variance modal */

  varianceModel: boolean = false;
  showVariance() {
    this.varianceModel = true;
  }
  hideModal() {
    this.varianceModel = false;
  }

  /* #endregion */

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild("popover", { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

}
