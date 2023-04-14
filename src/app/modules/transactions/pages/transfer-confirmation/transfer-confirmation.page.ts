import { Component, OnInit } from '@angular/core';
import { TransferConfirmationService } from '../../services/transfer-confirmation.service';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { TransferConfirmationRoot } from '../../models/inter-transfer';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-transfer-confirmation',
  templateUrl: './transfer-confirmation.page.html',
  styleUrls: ['./transfer-confirmation.page.scss'],
})
export class TransferConfirmationPage implements OnInit, ViewWillEnter {

  pendingList: TransferConfirmationRoot[] = [];

  constructor(
    public objectService: TransferConfirmationService,
    private authService: AuthService,
    private navController: NavController
  ) { }

  ionViewWillEnter(): void {
    this.loadPendingList();
  }

  ngOnInit() {
    
  }

  loadPendingList() {
    if (this.selectedLocationId) {
      this.objectService.getPendingList(this.objectService.locationMasterList.find(r => r.id === this.selectedLocationId).code).subscribe(response => {
        this.pendingList = response;
        console.log("🚀 ~ file: transfer-confirmation.page.ts:31 ~ TransferConfirmationPage ~ this.objectService.getPendingList ~ this.pendingList:", this.pendingList)
      }, error => {
        console.error(error);
      })
    }
  }

  selectedLocationId: number;
  onLocationChanged(event) {
    this.selectedLocationId = event.id;
    this.loadPendingList();
  }

  selectedObject: TransferConfirmationRoot;
  goToDetails(object: TransferConfirmationRoot) {
    this.selectedObject = object;
    this.selectedObject.line.forEach(r => {
      r.qtyReceive = r.qty;
    })
    this.objectService.setSelectedObject(this.selectedObject);
    this.navController.navigateForward("/transactions/transfer-confirmation/transfer-confirmation-item");
  }

  // hideModal() {
  //   this.isModalOpen = false;
  // }

  // onModalHide() {
  //   this.selectedObject = null;
  //   this.isModalOpen = false;
  // }

  // onItemAdd(event: TransactionDetail) {
  //   console.log("🚀 ~ file: transfer-confirmation.page.ts:66 ~ TransferConfirmationPage ~ onItemAdd ~ event:", event)    
  // }

  /* #region  barcode scanner */

  // scanActive: boolean = false;
  // onCameraStatusChanged(event) {
  //   try {
  //     this.scanActive = event;
  //     if (this.scanActive) {
  //       document.body.style.background = "transparent";
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // async onDoneScanning(event) {
  //   try {
  //     if (event) {
  //       await this.validateBarcode(event);
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  // async validateBarcode(barcode: string) {
  //   try {
  //     if (barcode) {
  //       if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
  //         let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
  //         if (found_barcode) {
  //           let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
  //           let outputData: TransactionDetail = {
  //             itemId: found_item_master.id,
  //             itemCode: found_item_master.code,
  //             description: found_item_master.itemDesc,
  //             variationTypeCode: found_item_master.varCd,
  //             discountGroupCode: found_item_master.discCd,
  //             discountExpression: found_item_master.discPct + '%',
  //             taxId: found_item_master.taxId,
  //             taxCode: found_item_master.taxCd,
  //             taxPct: found_item_master.taxPct,
  //             qtyRequest: null,
  //             itemPricing: {
  //               itemId: found_item_master.id,
  //               unitPrice: found_item_master.price,
  //               discountGroupCode: found_item_master.discCd,
  //               discountExpression: found_item_master.discPct + '%',
  //               discountPercent: found_item_master.discPct
  //             },
  //             itemVariationXId: found_barcode.xId,
  //             itemVariationYId: found_barcode.yId,
  //             itemSku: found_barcode.sku,
  //             itemBarcode: found_barcode.barcode
  //           }
  //           this.onItemAdd(outputData);
  //         } else {
  //           this.toastService.presentToast('Invalid Barcode', '', 'top', 'danger', 1000);
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  /* #endregion */

}
