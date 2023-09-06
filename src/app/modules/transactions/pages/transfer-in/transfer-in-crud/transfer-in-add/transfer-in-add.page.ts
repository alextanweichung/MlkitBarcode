import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { NavController, ActionSheetController, AlertController } from '@ionic/angular';
import { ConsignmentSalesLocation } from 'src/app/modules/transactions/models/consignment-sales';
import { TransferInLine, TransferInRoot } from 'src/app/modules/transactions/models/transfer-in';
import { TransferInService } from 'src/app/modules/transactions/services/transfer-in.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-transfer-in-add',
  templateUrl: './transfer-in-add.page.html',
  styleUrls: ['./transfer-in-add.page.scss'],
})
export class TransferInAddPage implements OnInit {

  selectedLocation: ConsignmentSalesLocation = null;
  pendingObject: TransferInRoot[] = [];

  constructor(
    public objectService: TransferInService,
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private navController: NavController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastService: ToastService
  ) {
    
  }
  
  ngOnInit() {
    if (this.objectService.locationList.findIndex(r => r.isPrimary) > -1) {
      this.selectedLocation = this.objectService.locationList.find(r => r.isPrimary);
      this.loadPendingList();
    }
    this.bindLocationList();
  }

  loadPendingList() {
    this.pendingObject = [];
    if (this.selectedLocation) {
      this.objectService.getPendingList(this.selectedLocation.locationCode).subscribe(response => {
        this.pendingObject = response;
      }, error => {
        console.error(error);
      })
    }
  }

  consignmentLocationSearchDropdownList: SearchDropdownList[] = [];
  bindLocationList() {
    this.consignmentLocationSearchDropdownList = [];
    try {
      this.objectService.locationList.forEach(r => {
        this.consignmentLocationSearchDropdownList.push({
          id: r.locationId,
          code: r.locationCode,
          description: r.locationDescription
        })
      })
    } catch (e) {
      console.error(e);
    }
  }

  onLocationChanged(event: any) {
    if (event) {
      this.selectedLocation = this.objectService.locationList.find(r => r.locationId === event.id);
      this.loadPendingList();
    }
  }

  selectDoc(object: TransferInRoot) {
    object.line.forEach(r => {
      if (r.qtyReceive === null) {
        r.qtyReceive = r.qty;
      }
    })
    console.log("🚀 ~ file: transfer-in-add.page.ts:103 ~ TransferInAddPage ~ selectDoc ~ object:", object)
    this.objectService.setObject(object);
    this.navController.navigateForward("/transactions/transfer-in/transfer-in-item");
  }

  async cancelInsert() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: "Are you sure to cancel?",
        subHeader: "Changes made will be discard.",
        cssClass: "custom-action-sheet",
        buttons: [
          {
            text: "Yes",
            role: "confirm",
          },
          {
            text: "No",
            role: "cancel",
          }]
      });
      await actionSheet.present();

      const { role } = await actionSheet.onWillDismiss();

      if (role === "confirm") {
        this.objectService.resetVariables();
        this.navController.navigateBack("/transactions/transfer-in");
      }
    } catch (e) {
      console.error(e);
    }
  }

}
