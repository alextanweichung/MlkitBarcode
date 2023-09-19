import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, AlertController } from '@ionic/angular';
import { ConsignmentSalesLocation } from 'src/app/modules/transactions/models/consignment-sales';
import { TransferInScanningRoot } from 'src/app/modules/transactions/models/transfer-in-scanning';
import { TransferInScanningService } from 'src/app/modules/transactions/services/transfer-in-scanning.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-transfer-in-scanning-add',
  templateUrl: './transfer-in-scanning-add.page.html',
  styleUrls: ['./transfer-in-scanning-add.page.scss'],
})
export class TransferInScanningAddPage implements OnInit {

  selectedLocation: ConsignmentSalesLocation = null;
  selectedPendingDoc: TransferInScanningRoot = null;
  pendingObject: TransferInScanningRoot[] = [];

  constructor(
    public objectService: TransferInScanningService,
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
        this.bindPendingList();
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

  pendingDocSearchDropdownList: SearchDropdownList[] = [];
  bindPendingList() {
    this.pendingDocSearchDropdownList = [];
    try {
      this.pendingObject.forEach(r => {
        this.pendingDocSearchDropdownList.push({
          id: r.interTransferId,
          code: r.interTransferNum.substring(0, 2),
          description: r.interTransferNum
        })
      })
    } catch (e) {
      console.error(e);
    }
  }

  onLocationChanged(event: any) {
    if (event) {
      this.selectedPendingDoc = null;
      this.selectedLocation = this.objectService.locationList.find(r => r.locationId === event.id);
      this.loadPendingList();
    }
  }

  onPendingDocChanged(event: any) {
    if (event) {
      this.selectedPendingDoc = this.pendingObject.find(r => r.interTransferId === event.id);
    }
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
        this.navController.navigateBack("/transactions/transfer-in-scanning");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    this.objectService.setObject(this.selectedPendingDoc);
    this.navController.navigateForward("/transactions/transfer-in-scanning/transfer-in-scanning-item");    
  }

}
