import { Component, OnInit, ViewChild } from '@angular/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { MasterList } from 'src/app/shared/models/master-list';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-scan-barcode',
   templateUrl: './scan-barcode.page.html',
   styleUrls: ['./scan-barcode.page.scss'],
})
export class ScanBarcodePage implements OnInit, ViewWillEnter {

   constructor(
      private commonService: CommonService,
      private navController: NavController
   ) { }

   async ionViewWillEnter(): Promise<void> {
      await this.loadMasterList();
   }

   ngOnInit() {
   }

   fullMasterList: MasterList[] = [];
   itemUomMasterList: MasterListDetails[] = [];
   itemVariationXMasterList: MasterListDetails[] = [];
   itemVariationYMasterList: MasterListDetails[] = [];
   async loadMasterList() {
      this.fullMasterList = await this.commonService.getMasterList();
      this.itemUomMasterList = this.fullMasterList.filter(x => x.objectName === "ItemUOM").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationXMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationX").flatMap(src => src.details).filter(y => y.deactivated === 0);
      this.itemVariationYMasterList = this.fullMasterList.filter(x => x.objectName === "ItemVariationY").flatMap(src => src.details).filter(y => y.deactivated === 0);
   }

   /* #region  camera scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   async onDoneScanning(event) {
      if (event) {
         await this.barcodescaninput.validateBarcode(event);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   selectedItem: TransactionDetail;
   onItemAdd(event: TransactionDetail[]) {
      if (event && event.length > 0) {
         this.selectedItem = event[0];
         try {
            this.barcodescaninput.setFocus();
         } catch (e) {
            console.error(e);
         }
      }
   }

   previousStep() {
      this.navController.navigateBack("/transactions");
   }

}
