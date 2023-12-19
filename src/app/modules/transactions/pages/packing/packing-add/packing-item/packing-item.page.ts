import { Component, OnInit, ViewChild } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { NavController, AlertController, IonAccordionGroup } from '@ionic/angular';
import { GoodsPackingHeader, GoodsPackingLine, GoodsPackingRoot, GoodsPackingSummary } from 'src/app/modules/transactions/models/packing';
import { PackingSalesOrderDetail, PackingSalesOrderRoot } from 'src/app/modules/transactions/models/packing-sales-order';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-packing-item',
   templateUrl: './packing-item.page.html',
   styleUrls: ['./packing-item.page.scss'],
   providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobilePacking' }]
})
export class PackingItemPage implements OnInit {

   objectHeader: GoodsPackingHeader;
   packingSalesOrders: PackingSalesOrderRoot[] = [];
   moduleControl: ModuleControl[] = [];
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   packingQtyControl: string = "0";

   constructor(
      private authService: AuthService,
      private configService: ConfigService,
      private commonService: CommonService,
      public objectService: PackingService,
      private navController: NavController,
      private alertController: AlertController,
      private toastService: ToastService,
   ) { }

   ngOnInit() {
      try {
         this.objectHeader = this.objectService.header;
         if (this.objectHeader === undefined) {
            this.navController.navigateBack('/transactions/packing/packing-sales-order');
         }
         this.packingSalesOrders = this.objectService.selectedSalesOrders;
         if (this.packingSalesOrders && this.packingSalesOrders.length > 0) {
            this.packingSalesOrders.flatMap(r => r.details).flatMap(r => r.qtyPackedCurrent = 0);
         }
         this.loadModuleControl();
      } catch (e) {
         console.error(e);
      }
   }

   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let packingControl = this.moduleControl.find(x => x.ctrlName === "PackingQtyControl");
            if (packingControl != undefined) {
               this.packingQtyControl = packingControl.ctrlValue;
            }
            let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
            if (ignoreCheckdigit != undefined) {
               this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
            }
         }, error => {
            console.error(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   /* #region  manual amend qty */

   onQtyChanged(event, soLine: PackingSalesOrderDetail, index: number) {
      try {
         if (Number.isInteger(event) && event >= 0) {
            if (this.objectHeader.isWithSo) {
               switch (this.packingQtyControl) {
                  // No control
                  case "0":
                     soLine.qtyPackedCurrent = event;
                     break;
                  // Not allow pack quantity more than SO quantity
                  case "1":
                     if (soLine.qtyPacked + event <= soLine.qtyRequest) {
                        soLine.qtyPackedCurrent = event;
                     } else {
                        soLine.qtyPackedCurrent = soLine.qtyRequest - soLine.qtyPacked;
                     }
                     break;
                  // Not allow pack quantity more than pick quantity
                  case "2":
                     if (soLine.qtyPacked + event <= soLine.qtyPicked) {
                        soLine.qtyPackedCurrent = event;
                     } else {
                        soLine.qtyPackedCurrent = soLine.qtyPicked - soLine.qtyPacked;
                     }
                     break;
               }
            }
            if (!this.objectHeader.isWithSo) {
               soLine.qtyPackedCurrent = event;
               if (soLine.qtyPackedCurrent === 0) {
                  this.deleteSoLine(index);
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  sales order */

   @ViewChild('accordianGroup1', { static: false }) accordianGroup1: IonAccordionGroup; // use accordion value to determine if selectedSo 
   selectedSo: PackingSalesOrderRoot;
   setSelectedSo(so) {
      this.selectedSo = so;
   }

   /* #endregion */

   /* #region  barcode & check so */

   async validateBarcode(barcode: string) {
      try {
         if (barcode) {
            if (this.configService.item_Barcodes && this.configService.item_Barcodes.length > 0) {
               let found_barcode = await this.configService.item_Barcodes.filter(r => r.barcode.length > 0).find(r => r.barcode === barcode);
               if (found_barcode) {
                  let found_item_master = await this.configService.item_Masters.find(r => found_barcode.itemId === r.id);
                  let outputData: TransactionDetail = {
                     itemId: found_item_master.id,
                     itemCode: found_item_master.code,
                     description: found_item_master.itemDesc,
                     typeCode: found_item_master.typeCode,
                     variationTypeCode: found_item_master.varCd,
                     discountGroupCode: found_item_master.discCd,
                     discountExpression: (found_item_master.discPct ?? "0") + '%',
                     taxId: found_item_master.taxId,
                     taxCode: found_item_master.taxCd,
                     taxPct: found_item_master.taxPct,
                     qtyRequest: null,
                     itemPricing: {
                        itemId: found_item_master.id,
                        unitPrice: found_item_master.price,
                        discountGroupCode: found_item_master.discCd,
                        discountExpression: (found_item_master.discPct ?? "0") + '%',
                        discountPercent: found_item_master.discPct ?? 0,
                        discountGroupId: null,
                        unitPriceMin: null,
                        currencyId: null
                     },
                     itemVariationXId: found_barcode.xId,
                     itemVariationYId: found_barcode.yId,
                     itemSku: found_barcode.sku,
                     itemBarcode: found_barcode.barcode
                  }
                  this.addItemToSo(outputData);
               } else {
                  this.toastService.presentToast('', 'Barcode not found.', 'top', 'danger', 1000);
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   onItemAdd(event: TransactionDetail) {
      this.addItemToSo(event);
   }

   selectedSoDetail: PackingSalesOrderDetail;
   async addItemToSo(trxLine: TransactionDetail) {
      try {
         if (this.objectHeader.isWithSo && this.accordianGroup1.value === undefined) {
            this.toastService.presentToast('Please select SO', '', 'top', 'medium', 1000);
            return;
         }
         if (this.objectHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
            let itemIndex = this.selectedSo.details.findIndex(r => r.itemSku === trxLine.itemSku);
            if (itemIndex > -1) {
               this.selectedSoDetail = this.selectedSo.details[itemIndex];
               this.selectedSo.details[itemIndex].qtyPackedCurrent += 1;
               this.onQtyChanged(this.selectedSo.details[itemIndex].qtyPackedCurrent, this.selectedSoDetail, itemIndex);
            } else {
               this.toastService.presentToast('Item not found in this SO', '', 'top', 'medium', 1000);
            }
         }
         if (!this.objectHeader.isWithSo) {
            if (this.packingSalesOrders && this.packingSalesOrders.length === 0) {
               this.packingSalesOrders.push({
                  header: null,
                  details: [],
                  pickingHistory: []
               })
            }
            if (this.packingSalesOrders[0].details.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
               this.selectedSoDetail = this.packingSalesOrders[0].details.find(r => r.itemSku === trxLine.itemSku);
               this.selectedSoDetail.qtyPackedCurrent++;
            } else {
               let d: PackingSalesOrderDetail = {
                  salesOrderId: null,
                  itemId: trxLine.itemId,
                  description: trxLine.description,
                  itemVariationXId: trxLine.itemVariationXId,
                  itemVariationYId: trxLine.itemVariationYId,
                  itemSku: trxLine.itemSku,
                  itemVariationTypeCode: trxLine.variationTypeCode,
                  itemCode: trxLine.itemCode,
                  itemVariationXDescription: trxLine.itemVariationXId ? this.objectService.itemVariationXMasterList.find(r => r.id === trxLine.itemVariationXId).description : null,
                  itemVariationYDescription: trxLine.itemVariationYId ? this.objectService.itemVariationYMasterList.find(r => r.id === trxLine.itemVariationYId).description : null,
                  itemUomId: null,
                  itemUomDescription: null,
                  rack: null,
                  subRack: null,
                  qtyRequest: 0,
                  qtyCommit: 0,
                  qtyBalance: 0,
                  qtyPicked: 0,
                  qtyPackedCurrent: 1,
                  qtyPacked: 0
               }
               await this.packingSalesOrders[0].details.length > 0 ? this.packingSalesOrders[0].details.unshift(d) : this.packingSalesOrders[0].details.push(d);
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async deleteSoLine(index) {
      try {
         if (this.packingSalesOrders[0]?.details[index]) {
            const alert = await this.alertController.create({
               cssClass: 'custom-alert',
               header: 'Delete this item?',
               message: 'This action cannot be undone.',
               buttons: [
                  {
                     text: 'Delete item',
                     cssClass: 'danger',
                     handler: async () => {
                        this.packingSalesOrders[0].details.splice(index, 1);
                        this.toastService.presentToast('Item removed.', '', 'top', 'success', 1000);
                     }
                  },
                  {
                     text: 'Cancel',
                     role: 'cancel',
                     cssClass: 'cancel'
                  }
               ]
            });
            await alert.present();
         } else {
            this.toastService.presentToast('Something went wrong!', '', 'top', 'danger', 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region  barcode scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onDoneScanning(event) {
      if (event) {
         await this.validateBarcode(event);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

   async nextStep() {
      try {
         let soLines: PackingSalesOrderDetail[] = this.packingSalesOrders.flatMap(r => r.details).filter(r => r.qtyPackedCurrent > 0);
         if (soLines.length > 0) {
            const alert = await this.alertController.create({
               cssClass: 'custom-alert',
               header: 'Are you sure to proceed?',
               buttons: [
                  {
                     text: 'Confirm',
                     cssClass: 'success',
                     handler: async () => {
                        await this.insertPacking(soLines);
                     },
                  },
                  {
                     text: 'Cancel',
                     role: 'cancel',
                     cssClass: 'cancel',
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

   insertPacking(soLines: any) {
      try {
         let object: GoodsPackingRoot;
         let lines: GoodsPackingLine[] = [];
         soLines.forEach(r => {
            lines.push({
               packingLineId: 0,
               packingId: 0,
               salesOrderId: r.salesOrderId,
               itemId: r.itemId,
               itemVariationXId: r.itemVariationXId,
               itemVariationYId: r.itemVariationYId,
               itemSku: r.itemSku,
               itemBarcode: this.configService.item_Barcodes.find(rr => rr.sku === r.itemSku)?.barcode,
               itemUomId: r.itemUomId,
               qtyRequest: r.qtyPackedCurrent,
               soRowIndex: this.objectHeader.isWithSo ? (this.packingSalesOrders.flatMap(rr => rr.details).findIndex(rr => rr.salesOrderId === r.salesOrderId && rr.itemSku === r.itemSku)) : null,
               sequence: lines.length,
               locationId: this.objectHeader.locationId,
               cartonNum: 1
            })
         })
         let header: GoodsPackingHeader = {
            packingId: 0,
            packingNum: '',
            trxDate: this.objectHeader.trxDate,
            locationId: this.objectHeader.locationId,
            toLocationId: this.objectHeader.toLocationId,
            customerId: this.objectHeader.customerId,
            warehouseAgentId: this.objectHeader.warehouseAgentId,
            businessModelType: this.objectHeader.businessModelType,
            sourceType: 'M',
            isWithSo: this.objectHeader.isWithSo,
            remark: this.objectHeader.remark,
            typeCode: this.objectHeader.typeCode,
            totalCarton: 1
         }
         object = {
            header: header,
            details: lines
         }
         this.objectService.insertPacking(object).subscribe(response => {
            if (response.status === 201) {
               let ps: GoodsPackingSummary = {
                  packingNum: response.body["header"]["packingNum"],
                  customerId: response.body["header"]["customerId"],
                  locationId: response.body["header"]["locationId"],
                  trxDate: response.body["header"]["trxDate"]
               }
               this.objectService.setPackingSummary(ps);
               this.toastService.presentToast('Packing has been added', '', 'top', 'success', 1000);
               this.navController.navigateForward('/transactions/packing/packing-summary');
            }
         }, error => {
            console.log(error);
         })
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      this.navController.navigateBack('/transactions/packing/packing-sales-order');
   }

}
