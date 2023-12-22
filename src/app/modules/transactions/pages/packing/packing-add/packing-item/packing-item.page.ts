import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { AlertController, IonPopover, ModalController, NavController, ViewDidEnter } from '@ionic/angular';
import { format } from 'date-fns';
import { CurrentPackList, MultiPackingCarton, MultiPackingObject, MultiPackingRoot, PackingLineVariation, SalesOrderLineForWD } from 'src/app/modules/transactions/models/packing';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { JsonDebug } from 'src/app/shared/models/jsonDebug';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { LineAssembly, TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
   selector: 'app-packing-item',
   templateUrl: './packing-item.page.html',
   styleUrls: ['./packing-item.page.scss'],
   providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobilePacking' }]
})
export class PackingItemPage implements OnInit, ViewDidEnter {

   @ViewChild("barcodescaninput", { static: false }) barcodescaninput: BarcodeScanInputPage;
   systemWideEAN13IgnoreCheckDigit: boolean = false;
   showItemList: boolean = false;

   constructor(
      private authService: AuthService,
      public configService: ConfigService,
      private commonService: CommonService,
      public objectService: PackingService,
      private navController: NavController,
      private alertController: AlertController,
      private toastService: ToastService,
      private modalController: ModalController
   ) { }

   ionViewDidEnter(): void {
      try {
         this.barcodescaninput.setFocus();
      } catch(e) {
         console.error(e);
      }
   }

   ngOnInit() {
      this.loadModuleControl();
      if (this.objectService.multiPackingObject.packingCarton.length === 0) {
         this.addCarton();
      } else {
         this.selectedCartonNum = this.objectService.multiPackingObject.packingCarton[0].cartonNum;
      }
   }

   moduleControl: ModuleControl[] = [];
   allowDocumentWithEmptyLine: string = "N";
   packingQtyControl: string = "0";
   packingMatchPickingQty: string = "0";
   systemWideScanningMethod: string;
   systemWideBlockConvertedCode: boolean;
   packingActivateReasonSelection: boolean = false;
   loadModuleControl() {
      this.authService.moduleControlConfig$.subscribe(obj => {
         this.moduleControl = obj;
         let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
         if (config != undefined) {
            this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
         }
         let packingControl = this.moduleControl.find(x => x.ctrlName === "PackingQtyControl");
         if (packingControl != undefined) {
            this.packingQtyControl = packingControl.ctrlValue;
         }
         let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
         if (ignoreCheckdigit != undefined) {
            this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
         }
         let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
         if (scanningMethod != undefined) {
            this.systemWideScanningMethod = scanningMethod.ctrlValue;
         }
         let packPickCtrl = this.moduleControl.find(x => x.ctrlName === "PackingMatchPickingQty");
         if (packPickCtrl) {
            this.packingMatchPickingQty = packPickCtrl.ctrlValue;
         }
         let activateReason = this.moduleControl.find(x => x.ctrlName === "PackingActivateReasonSelection")
         if (activateReason) {
            this.packingActivateReasonSelection = activateReason.ctrlValue.toUpperCase() === "Y" ? true : false;
         }
         let blockConvertedCode = this.moduleControl.find(x => x.ctrlName === "SystemWideBlockConvertedCode")
         if (blockConvertedCode) {
            this.systemWideBlockConvertedCode = blockConvertedCode.ctrlValue.toUpperCase() === "Y" ? true : false;
         } else {
            this.systemWideBlockConvertedCode = false;
         }
      })
   }

   /* #region picking engine */

   runPackingEngine(itemFound: TransactionDetail, inputQty: number) {
      if (itemFound) {
         let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.isComponentScan && x.assembly && x.assembly.length > 0);
         let findMainCodeScanned = findAssemblyItem.find(x => x.itemId == itemFound.itemId);
         if (findMainCodeScanned) {
            this.toastService.presentToast("Control Validation", "Please scan component item code instead of main assembly code.", "top", "warning", 1000);
            return;
         }
         let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemSku == itemFound.itemSku);
         console.log("🚀 ~ file: packing-item.page.ts:103 ~ PackingItemPage ~ runPackingEngine ~ outstandingLines:", JSON.stringify(outstandingLines));
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
            let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
            switch (this.packingQtyControl.toUpperCase()) {
               //No control
               case "0":
                  this.insertPackingLine(itemFound, inputQty, outstandingLines, "N");
                  break;
               //Not allow pack quantity more than SO quantity
               case "1":
                  if (osTotalAvailableQty >= inputQty) {
                     this.insertPackingLine(itemFound, inputQty, outstandingLines, "1");
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked == totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     let operationSuccess = this.runAssemblyPackingEngine(itemFound, inputQty, findAssemblyItem);
                     if (!operationSuccess) {
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
               //Not allow pack quantity more than pick quantity
               case "1":
                  if (osTotalAvailableQtyPicked >= inputQty) {
                     this.insertPackingLine(itemFound, inputQty, outstandingLines, "2");
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyPicked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     if (totalQtyCurrent + totalQtyPacked == totalQtyPicked) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     let operationSuccess = this.runAssemblyPackingEngine(itemFound, inputQty, findAssemblyItem);
                     if (!operationSuccess) {
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded picking quantity.", "top", "warning", 1000);
                     }
                  }
                  break;
            }
         } else {
            let operationSuccess = this.runAssemblyPackingEngine(itemFound, inputQty, findAssemblyItem);
            if (!operationSuccess) {
               this.toastService.presentToast("Control Validation", "Item is not available in the selected Sales Order.", "top", "warning", 1000);
            }
         }
      } else {
         this.toastService.presentToast("Control Validation", "Invalid Item Barcode", "top", "warning", 1000);
      }
   }

   runAssemblyPackingEngine(itemFound: TransactionDetail, inputQty: number, findAssemblyItem: SalesOrderLineForWD[]) {
      let findComponentItem: LineAssembly;
      if (findAssemblyItem) {
         findAssemblyItem.forEach(item => {
            findComponentItem = item.assembly.find(x => x.itemComponentId == itemFound.itemId);
         })
      }
      if (findComponentItem) {
         let mainItemFound = this.objectService.multiPackingObject.outstandingPackList.find(x => x.itemId == findComponentItem.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
         let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId == findComponentItem.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
         let assemblyOutstandingLines = outstandingLines.flatMap(x => x.assembly).filter(y => y.itemComponentId == itemFound.itemId);
         console.log("🚀 ~ file: packing-item.page.ts:150 ~ PackingItemPage ~ runAssemblyPackingEngine ~ assemblyOutstandingLines:", JSON.stringify(assemblyOutstandingLines))
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyRequest ?? 0), 0);
            let osTotalQtyPicked = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyPicked ?? 0), 0);
            let osTotalQtyPacked = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyPacked ?? 0), 0);
            let osTotalQtyCurrent = assemblyOutstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
            let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
            switch (this.packingQtyControl.toUpperCase()) {
               //No control
               case "0":
                  this.insertAssemblyPackingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                  break;
               //Not allow pick quantity more than SO quantity
               case "1":
                  if (osTotalAvailableQty >= inputQty) {
                     this.insertAssemblyPackingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked == totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity. 22", "top", "warning", 1000);
                  }
                  break;
               //Not allow pack quantity more than pick quantity
               case "2":
                  if (osTotalAvailableQtyPicked >= inputQty) {
                     this.insertAssemblyPackingLine(itemFound, inputQty, outstandingLines, mainItemFound.itemId);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyCurrent, 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPacked, 0);
                     let totalQtyPicked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     if (totalQtyCurrent + totalQtyPacked == totalQtyPicked) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     this.toastService.presentToast("Control Validation", "Input quantity exceeded picking quantity.", "top", "warning", 1000);
                  }
                  break;
            }
         }
         return true;
      } else {
         return false;
      }
   }

   checkPackingRules(itemSku: string, inputQty: number) {
      let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemSku == itemSku);
      if (outstandingLines.length > 0) {
         let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
         let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
         let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
         let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
         let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
         let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
         switch (this.packingQtyControl) {
            //No control
            case "0":
               return true;
            //Not allow pack quantity more than SO quantity
            case "1":
               if (osTotalAvailableQty >= inputQty) {
                  return true;
               } else {
                  return false;
               }
            //Not allow pack quantity more than pick quantity
            case "2":
               if (osTotalAvailableQtyPicked >= inputQty) {
                  return true;
               } else {
                  return false;
               }
         }
      } else {
         return false;
      }
   }

   checkAssemblyPackingRules(assemblyItemId: number, itemId: number, inputQty: number) {
      let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId == assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
      let outstandingLines = findAssemblyItem.flatMap(x => x.assembly).filter(y => y.itemComponentId == itemId);
      if (outstandingLines.length > 0) {
         let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
         let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
         let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
         let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
         let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPacked - osTotalQtyCurrent;
         let osTotalAvailableQtyPicked = osTotalQtyPicked - osTotalQtyPacked - osTotalQtyCurrent;
         switch (this.packingQtyControl) {
            //No control
            case "0":
               return true;
            //Not allow pack quantity more than SO quantity
            case "1":
               if (osTotalAvailableQty >= inputQty) {
                  return true;
               } else {
                  return false;
               }
            //Not allow pack quantity more than pick quantity
            case "2":
               if (osTotalAvailableQtyPicked >= inputQty) {
                  return true;
               } else {
                  return false;
               }
         }
      } else {
         return false;
      }
   }

   insertAssemblyPackingLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: SalesOrderLineForWD[], assemblyItemId: number) {
      console.log("🚀 ~ file: packing-item.page.ts:199 ~ PackingItemPage ~ insertAssemblyPackingLine ~ inputQty:", inputQty)
      //When scanning the same item, add the quantity to first line, instead of adding new row
      let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      console.log("🚀 ~ file: packing-item.page.ts:202 ~ PackingItemPage ~ insertAssemblyPackingLine ~ packingCartonTag:", JSON.stringify(packingCartonTag))
      if (packingCartonTag && packingCartonTag.packList.length > 0 && itemFound.itemBarcode && itemFound.itemBarcode == packingCartonTag?.packList[0]?.itemBarcode && packingCartonTag?.packList[0]?.assemblyItemId == assemblyItemId) {
         let firstPickingLine = packingCartonTag.packList[0];
         firstPickingLine.qtyPacked = (firstPickingLine.qtyPacked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty, assemblyItemId);
         newLine.cartonNum = packingCartonTag.cartonNum;
         packingCartonTag.packList.unshift(newLine);
      }

      //Filter out currentPickList with same item
      let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemId == itemFound.itemId && x.assemblyItemId);
      this.computeAssemblyPackingAssignment(inputQty, outstandingLines, packListLines);
   }

   computeAssemblyPackingAssignment(inputQty: number, outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      console.log("🚀 ~ file: packing-item.page.ts:219 ~ PackingItemPage ~ computeAssemblyPackingAssignment ~ inputQty:", inputQty)
      //Update left side qtyCurrent
      for (let os of outstandingLines) {
         for (let assembly of os.assembly) {
            if (assembly.itemComponentId == currentPackListLines[0].itemId) {
               let availableQty = (assembly.qtyRequest ?? 0) - (assembly.qtyPacked ?? 0) - (assembly.qtyCurrent ?? 0);
               if (availableQty >= inputQty) {
                  assembly.qtyCurrent = (assembly.qtyCurrent ?? 0) + inputQty;
                  inputQty = 0;
               } else {
                  assembly.qtyCurrent = (assembly.qtyCurrent ?? 0) + availableQty;
                  inputQty = (inputQty ?? 0) - (availableQty ?? 0)
               }
            }

            assembly.qtyPossible = (assembly.qtyCurrent ?? 0) / assembly.itemComponentQty;
         }
         let qtyPossibleArray = os.assembly.map(x => x.qtyPossible);
         if (qtyPossibleArray.length > 0) {
            qtyPossibleArray.sort((a, b) => a - b);
            os.qtyCurrent = qtyPossibleArray[0];
         }
      }
      //This condition only applies to picking without control. User will be able to overscan  
      if (inputQty != 0) {
         let findFirstAssembly = outstandingLines[0].assembly.find(x => x.itemComponentId == currentPackListLines[0].itemId);
         if (findFirstAssembly) {
            findFirstAssembly.qtyCurrent = (findFirstAssembly.qtyCurrent ?? 0) + inputQty;
            inputQty = 0;
         }
      }
      this.mapAssemblyPackingAssignment(outstandingLines, currentPackListLines);
   }

   mapAssemblyPackingAssignment(outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      currentPackListLines.forEach(x => {
         x.variations = [];
      })
      currentPackListLines.reverse();
      let duplicateOutstandingLines: SalesOrderLineForWD[] = JSON.parse(JSON.stringify(outstandingLines));
      currentPackListLines.forEach(current => {
         let balanceQty: number = current.qtyPacked;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            for (let assembly of os.assembly) {
               if (assembly.itemComponentId == currentPackListLines[0].itemId) {
                  let currentPickAssignment: PackingLineVariation = {
                     qtyPacked: assembly.qtyCurrent,
                     salesOrderId: os.salesOrderId,
                     salesOrderLineId: os.salesOrderLineId,
                     salesOrderVariationId: os.salesOrderVariationId
                  }
                  if (balanceQty != 0) {
                     if (balanceQty == assembly.qtyCurrent) {
                        currentPickAssignment.qtyPacked = balanceQty;
                        current.variations.push(currentPickAssignment);
                        duplicateOutstandingLines.shift();
                        balanceQty = 0;
                        break;
                     }
                     else if (balanceQty > assembly.qtyCurrent) {
                        currentPickAssignment.qtyPacked = assembly.qtyCurrent;
                        current.variations.push(currentPickAssignment);
                        balanceQty = (balanceQty ?? 0) - (assembly.qtyCurrent ?? 0);
                        rightLoopCount++;
                     }
                     else if (balanceQty < assembly.qtyCurrent) {
                        currentPickAssignment.qtyPacked = balanceQty;
                        current.variations.push(currentPickAssignment);
                        assembly.qtyCurrent = (assembly.qtyCurrent ?? 0) - (balanceQty ?? 0);
                        balanceQty = 0;
                     }
                  }
               }
            }
         }
         if (rightLoopCount > 0) {
            duplicateOutstandingLines.splice(0, rightLoopCount);
         }
      })
   }

   insertPackingLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: SalesOrderLineForWD[], packingQtyControl: string) {
      // When scanning the same item, add the quantity to first line, instead of adding new row
      let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (packingCartonTag && packingCartonTag.packList.length > 0 && itemFound.itemBarcode == packingCartonTag?.packList[0]?.itemBarcode) {
         let firstPickingLine = packingCartonTag.packList[0];
         firstPickingLine.qtyPacked = (firstPickingLine.qtyPacked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
         newLine.cartonNum = packingCartonTag.cartonNum;
         packingCartonTag.packList.unshift(newLine);
      }
      // Filter out currentPickList with same item
      let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemSku == itemFound.itemSku);
      this.computePickingAssignment(inputQty, outstandingLines, packListLines);
      // this.setDataEntryState();
      // this.objectForm.markAsDirty();
      // this.barcodeScan.setInputFocus();
   }

   assignItemFoundToNewLine(itemFound: any, inputQty: number, assemblyItemId ?: number) {
      let newLine: CurrentPackList = {
         multiPackingLineId: 0,
         multiPackingId: this.objectService.header.multiPackingId,
         itemId: itemFound.itemId,
         itemCode: itemFound.itemCode,
         itemVariationXId: itemFound.itemVariationXId,
         itemVariationYId: itemFound.itemVariationYId,
         itemVariationXDescription: this.objectService.itemVariationXMasterList.find(r => r.id === itemFound.itemVariationXId)?.description,
         itemVariationYDescription: this.objectService.itemVariationYMasterList.find(r => r.id === itemFound.itemVariationYId)?.description,
         itemSku: itemFound.itemSku,
         itemUomId: itemFound.itemUomId,
         itemBarcode: itemFound.itemBarcode,
         description: itemFound.description,
         qtyPacked: inputQty,
         sequence: 0,
         lineUDDate: null,
         masterUDGroup1: null,
         masterUDGroup2: null,
         masterUDGroup3: null,
         locationId: this.objectService.header.locationId,
         cartonNum: 0,
         deactivated: false,
         variations: []
      }
      if (assemblyItemId) {
         newLine.assemblyItemId = assemblyItemId;
      }
      return newLine;
   }

   computePickingAssignment(inputQty: number, outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      // Update left side qtyCurrent
      for (let os of outstandingLines) {
         let availableQty = os.qtyRequest - os.qtyPacked - os.qtyCurrent;
         if (availableQty >= inputQty) {
            os.qtyCurrent = (os.qtyCurrent ?? 0) + inputQty;
            inputQty = 0;
         } else {
            os.qtyCurrent = (os.qtyCurrent ?? 0) + availableQty;
            inputQty = (inputQty ?? 0) - (availableQty ?? 0)
         }
      }
      // This condition only applies to picking without control. User will be able to overscan  
      if (inputQty != 0) {
         outstandingLines[0].qtyCurrent = (outstandingLines[0].qtyCurrent ?? 0) + inputQty;
         inputQty = 0;
      }
      this.mapPickingAssignment(outstandingLines, currentPackListLines);
   }

   mapPickingAssignment(outstandingLines: SalesOrderLineForWD[], currentPackListLines: CurrentPackList[]) {
      currentPackListLines.forEach(x => {
         x.variations = [];
      })
      currentPackListLines.reverse();
      let duplicateOutstandingLines = JSON.parse(JSON.stringify(outstandingLines));
      currentPackListLines.forEach(current => {
         let balanceQty: number = current.qtyPacked;
         let rightLoopCount: number = 0;
         for (let os of duplicateOutstandingLines) {
            let currentPickAssignment: PackingLineVariation = {
               qtyPacked: os.qtyCurrent,
               salesOrderId: os.salesOrderId,
               salesOrderLineId: os.salesOrderLineId,
               salesOrderVariationId: os.salesOrderVariationId
            }
            if (balanceQty != 0) {
               if (balanceQty == os.qtyCurrent) {
                  currentPickAssignment.qtyPacked = balanceQty;
                  current.variations.push(currentPickAssignment);
                  duplicateOutstandingLines.shift();
                  balanceQty = 0;
                  break;
               }
               else if (balanceQty > os.qtyCurrent) {
                  currentPickAssignment.qtyPacked = os.qtyCurrent;
                  current.variations.push(currentPickAssignment);
                  balanceQty = (balanceQty ?? 0) - (os.qtyCurrent ?? 0);
                  rightLoopCount++;
               }
               else if (balanceQty < os.qtyCurrent) {
                  currentPickAssignment.qtyPacked = balanceQty;
                  current.variations.push(currentPickAssignment);
                  os.qtyCurrent = (os.qtyCurrent ?? 0) - (balanceQty ?? 0);
                  balanceQty = 0;
               }
            }
         }
         if (rightLoopCount > 0) {
            duplicateOutstandingLines.splice(0, rightLoopCount);
         }
      })
   }

   insertPackingLineWithoutSo(itemFound: TransactionDetail, inputQty: number) {
      let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      if (packingCartonTag && packingCartonTag.packList.length > 0 && itemFound.itemBarcode == packingCartonTag?.packList[0]?.itemBarcode) {
         let firstPickingLine = packingCartonTag.packList[0];
         firstPickingLine.qtyPacked = (firstPickingLine.qtyPacked ?? 0) + inputQty;
      } else {
         let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
         newLine.cartonNum = packingCartonTag.cartonNum;
         packingCartonTag.packList.unshift(newLine);
      }
   }

   lookupItemInfo(itemId: number, lookupInfoType: string) {
      if (lookupInfoType == "CODE" && Capacitor.getPlatform() !== "web") {
         let findItem = this.configService.item_Masters.find(x => x.id == itemId);
         if (findItem) {
            return findItem.code;
         } else {
            return null;
         }
      } else {
         return null;
      }
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

   /* #region carton segment */

   selectedCartonNum: number = 0;
   addCarton() {
      let nextCartonNum = this.objectService.multiPackingObject.packingCarton.length > 0 ? this.objectService.multiPackingObject.packingCarton[0].cartonNum + 1 : 1;
      let newPickList: CurrentPackList[] = [];
      let defaultPackaging = this.objectService.packagingMasterList.find(x => x.isPrimary);
      let newCarton: MultiPackingCarton = {
         cartonNum: nextCartonNum,
         packList: newPickList,
         cartonHeight: null,
         cartonWidth: null,
         cartonLength: null,
         cartonWeight: null,
         cartonCbm: null,
         packagingId: defaultPackaging ? defaultPackaging.id: null,
         cartonBarcode: null
      };
      this.objectService.multiPackingObject.packingCarton.unshift(newCarton);
      this.selectedCartonNum = nextCartonNum;
   }

   async deleteCarton() {
      try {
         if (this.selectedCartonNum) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Are you sure to delete?",
               subHeader: "Changes made will be discard.",
               buttons: [
                  {
                     text: "OK",
                     role: "confirm",
                     cssClass: "danger",
                     handler: async () => {
                        if (this.objectService.header.isWithSo) {
                           await this.objectService.multiPackingObject.packingCarton.find(r => Number(this.selectedCartonNum) === Number(r.cartonNum)).packList.forEach(item => {
                              this.resetOutstandingListQuantityCurrent(item);
                           })
                           this.objectService.multiPackingObject.packingCarton = this.objectService.multiPackingObject.packingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        } else {
                           this.objectService.multiPackingObject.packingCarton = this.objectService.multiPackingObject.packingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                        }
                        this.selectedCartonNum = this.objectService.multiPackingObject.packingCarton.length > 0 ? this.objectService.multiPackingObject.packingCarton[0].cartonNum : null;
                     },
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     handler: () => {

                     }
                  },
               ],
            });
            await alert.present();
         } else {
            this.toastService.presentToast("", "Please select a carton.", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   async deleteCartonLine(rowIndex: number, item: CurrentPackList) {
      try {
         if (this.selectedCartonNum) {
            const alert = await this.alertController.create({
               cssClass: "custom-alert",
               header: "Are you sure to delete?",
               subHeader: "Changes made will be discard.",
               buttons: [
                  {
                     text: "OK",
                     role: "confirm",
                     cssClass: "danger",
                     handler: async () => {
                        this.resetOutstandingListQuantityCurrent(item);
                        let packingCartonTag = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
                        if (packingCartonTag) {
                           let rowIndex = packingCartonTag.packList.findIndex(x => x == item);
                           packingCartonTag.packList.splice(rowIndex, 1);
                           packingCartonTag.packList = [...packingCartonTag.packList];
                        }
                     },
                  },
                  {
                     text: "Cancel",
                     role: "cancel",
                     handler: () => {

                     }
                  },
               ],
            });
            await alert.present();
         } else {
            this.toastService.presentToast("", "Please select a carton.", "top", "warning", 1000);
         }
      } catch (e) {
         console.error(e);
      }
   }

   resetOutstandingListQuantityCurrent(item: CurrentPackList) {
      if (item.assemblyItemId) {
         let findOs = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.isComponentScan && x.assembly && x.assembly.length > 0 && x.itemId == item.assemblyItemId);
         if (findOs.length > 0) {
            let inputQty = item.qtyPacked;
            findOs.forEach(os => {
               os.assembly.forEach(assembly => {
                  if (assembly.itemComponentId == item.itemId) {
                     if (assembly.qtyCurrent >= inputQty) {
                        assembly.qtyCurrent -= inputQty;
                        inputQty = 0;
                     } else {
                        assembly.qtyCurrent = 0;
                        inputQty -= assembly.qtyCurrent
                     }
                  }
                  assembly.qtyPossible = assembly.qtyCurrent / assembly.itemComponentQty;
               })
               let qtyPossibleArray = os.assembly.map(x => x.qtyPossible);
               if (qtyPossibleArray.length > 0) {
                  qtyPossibleArray.sort((a, b) => a - b);
                  os.qtyCurrent = qtyPossibleArray[0];
               }
            })
         }
      } else {
         if (item.variations) {
            item.variations.forEach(inner => {
               let findOs = this.objectService.multiPackingObject.outstandingPackList.find(x => x.salesOrderVariationId == inner.salesOrderVariationId);
               if (findOs) {
                  findOs.qtyCurrent -= inner.qtyPacked;
               }
            })
         }
      }
   }

   getCartonItems() {
      if (Number(this.selectedCartonNum) > 0) {
         return this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList;
      }
      return [];
   }

   getCarton(){
      if (Number(this.selectedCartonNum) > 0) {
         return this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
      }
      return null;
   }

   /* #endregion */

   /* #region barcode & check so */

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
                     discountExpression: (found_item_master.discPct ?? "0") + "%",
                     taxId: found_item_master.taxId,
                     taxCode: found_item_master.taxCd,
                     taxPct: found_item_master.taxPct,
                     qtyRequest: null,
                     itemPricing: {
                        itemId: found_item_master.id,
                        unitPrice: found_item_master.price,
                        discountGroupCode: found_item_master.discCd,
                        discountExpression: (found_item_master.discPct ?? "0") + "%",
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
                  return outputData;
               } else {
                  this.toastService.presentToast("", "Barcode not found.", "top", "danger", 1000);
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #region for web testing */

   itemSearchValue: string;
   handleKeyDown(event) {
      if (event.keyCode === 13) {
         if (this.objectService.multiPackingObject.packingCarton.length === 0) {
            this.toastService.presentToast("Control Validation", "Please create carton before adding items.", "top", "warning", 1000);
         } else {
            this.objectService.validateBarcode(this.itemSearchValue).subscribe(async response => {
               this.itemSearchValue = null;
               if (response) {
                  if (this.objectService.header.isWithSo) {
                     await this.runPackingEngine(response, Number(1));
                  } else {
                     await this.insertPackingLineWithoutSo(response, Number(1));
                  }
               }
            }, error => {
               console.error(error);
            })
         }
         event.preventDefault();
      }
   }

   /* #endregion */

   async onItemAdd(event: TransactionDetail[]) {
      try {
         if (this.objectService.multiPackingObject.packingCarton.length === 0) {
            this.toastService.presentToast("Control Validation", "Please create carton before adding items.", "top", "warning", 1000);
         } else {
            if (event) {
               if (this.objectService.header.isWithSo) {
                  event.forEach(async r => {
                     let isBlock: boolean = false;
                     isBlock = this.validateNewItemConversion(r);
                     if (!isBlock) {
                        await this.runPackingEngine(r, Number(1));
                     }
                  })
               } else {
                  // Not allow to add assembly item for scanning without document
                  if (event && event.length > 0 && event.filter(r => r.typeCode === "AS")?.length > 0) {
                     this.toastService.presentToast("Assembly Item Detected", `Item ${event.filter(r => r.typeCode === "AS").flatMap(r => r.itemCode).join(", ")} is assembly type. Not allow in transaction.`, "top", "warning", 1000);
                     return;
                  }
                  event.forEach(async r => {
                     let isBlock: boolean = false;
                     isBlock = this.validateNewItemConversion(r);
                     if (!isBlock) {
                        await this.insertPackingLineWithoutSo(r, Number(1));
                     }
                  })
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   /* #endregion */

   /* #region update carton line qty */

   async editCartonLine(item: CurrentPackList) {
      await this.clonePackingQty(item);
      const alert = await this.alertController.create({
         cssClass: "custom-alert",
         backdropDismiss: false,
         header: "Enter Quantity",
         inputs: [
            {
               name: "inputQty",
               type: "number",
               placeholder: "Enter Quantity",
               value: Number(item.qtyPacked),
               min: 1
            }
         ],
         buttons: [
            {
               text: "OK",
               role: "confirm",
               cssClass: "success",
               handler: async (data) => {
                  item.qtyPacked = Number(data.inputQty);
                  this.updatePackingQty(item);
               },
            },
            {
               text: "Cancel",
               role: "cancel"
            },
         ],
      });
      await alert.present();
   }

   clonedQty: { [s: number]: CurrentPackList } = { };
   clonePackingQty(item: CurrentPackList) {
      let rowIndex = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList.findIndex(x => x == item);
      this.clonedQty[rowIndex] = { ...item };
   }

   updatePackingQty(item: CurrentPackList) {
      let rowIndex = this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum))?.packList.findIndex(x => x == item);
      let inputQty: number = item.qtyPacked - this.clonedQty[rowIndex].qtyPacked
      if (!item.assemblyItemId) {
         let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemSku == item.itemSku);
         let outstandingLines = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemSku == item.itemSku);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyPiacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
            switch (this.packingQtyControl) {
               //No control
               case "N":
                  this.resetOutstandingListQuantityCurrent(item);
                  this.computePickingAssignment(item.qtyPacked, outstandingLines, packListLines);
                  break;
               //Not allow pack quantity more than SO quantity
               case "Y":
                  if (osTotalAvailableQty >= inputQty) {
                     this.resetOutstandingListQuantityCurrent(item);
                     this.computePickingAssignment(item.qtyPacked, outstandingLines, packListLines);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked == totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     if (this.objectService.multiPackingObject.packingCarton.findIndex(r => Number(r.cartonNum) === Number(this.selectedCartonNum)) > -1) {
                        this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList[rowIndex] = this.clonedQty[rowIndex];
                        this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList = [...this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList];
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity. 44", "top", "warning", 1000);
                     }
                  }
                  break;
            }
         } else {
            this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
         }
      } else {
         let findAssemblyItem: SalesOrderLineForWD[] = this.objectService.multiPackingObject.outstandingPackList.filter(x => x.itemId == item.assemblyItemId && x.isComponentScan && x.assembly && x.assembly.length > 0);
         let outstandingLines = findAssemblyItem.flatMap(x => x.assembly).filter(y => y.itemComponentId == item.itemId);
         let packListLines = this.objectService.multiPackingObject.packingCarton.flatMap(x => x.packList).filter(x => x.itemId == item.itemId && x.assemblyItemId);
         if (outstandingLines.length > 0) {
            let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
            let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
            let osTotalQtyPacked = outstandingLines.reduce((sum, current) => sum + current.qtyPacked, 0);
            let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
            let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
            switch (this.packingQtyControl) {
               //No control
               case "N":
                  let clonedItem = JSON.parse(JSON.stringify(item));
                  let aggregatedQtyPicked = packListLines.reduce((sum, current) => sum + current.qtyPacked, 0);
                  clonedItem.qtyPicked = aggregatedQtyPicked - item.qtyPacked + this.clonedQty[rowIndex].qtyPacked;
                  this.resetOutstandingListQuantityCurrent(clonedItem);
                  this.computeAssemblyPackingAssignment(aggregatedQtyPicked, findAssemblyItem, packListLines);
                  break;
               //Not allow pack quantity more than SO quantity
               case "Y":
                  if (osTotalAvailableQty >= inputQty) {
                     let clonedItem = JSON.parse(JSON.stringify(item));
                     let aggregatedQtyPicked = packListLines.reduce((sum, current) => sum + current.qtyPacked, 0);
                     clonedItem.qtyPicked = aggregatedQtyPicked - item.qtyPacked + this.clonedQty[rowIndex].qtyPacked;
                     this.resetOutstandingListQuantityCurrent(clonedItem);
                     this.computeAssemblyPackingAssignment(aggregatedQtyPicked, findAssemblyItem, packListLines);
                     let totalQtyCurrent = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + (current.qtyCurrent ?? 0), 0);
                     let totalQtyPacked = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyPicked, 0);
                     let totalQtyRequest = this.objectService.multiPackingObject.outstandingPackList.reduce((sum, current) => sum + current.qtyRequest, 0);
                     if (totalQtyCurrent + totalQtyPacked == totalQtyRequest) {
                        this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
                     }
                  } else {
                     if (this.objectService.multiPackingObject.packingCarton.findIndex(r => Number(r.cartonNum) === Number(this.selectedCartonNum)) > -1) {
                        this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList[rowIndex] = this.clonedQty[rowIndex];
                        this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList = [...this.objectService.multiPackingObject.packingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).packList];
                        this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity. 33", "top", "warning", 1000);
                     }
                  }
                  break;
            }
         } else {
            this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
         }
      }
      delete this.clonedQty[rowIndex];
   }

   validateNewItemConversion(itemList: TransactionDetail) {
      if (itemList.newItemId && itemList.newItemEffectiveDate && this.commonService.convertUtcDate(itemList.newItemEffectiveDate) <= this.objectService.header.trxDate) {
         let newItemCode = this.configService.item_Masters.find(r => r.id === itemList.newItemId);
         if (newItemCode) {
            this.toastService.presentToast("Converted Code Detected", `Item ${itemList.itemCode} has been converted to ${newItemCode.code} effective from ${format(itemList.newItemEffectiveDate, "dd/MM/yyyy")}`, "top", "warning", 1000);
            if (this.systemWideBlockConvertedCode) {
               return true;
            } else {
               return false;
            }
         } else {
            return false;
         }
      } else {
         return false;
      }
   }

   /* #endregion */

   /* #region show variaton dialog */

   selectedItem: TransactionDetail;
   showDetails(item: any) {
      if (item.variationTypeCode === "1" || item.variationTypeCode === "2") {
         // this.object.details.filter(r => r.lineId !== item.lineId).flatMap(r => r.isSelected = false);
         item.isSelected = !item.isSelected;
      }
   }

   /* #endregion */

   /* #region image modal */

   isImageModalOpen: boolean = false;
   imageUrl: string;
   showImageModal(itemCode: string) {
      let itemId = this.objectService.multiPackingObject.outstandingPackList.find(r => r.itemCode === itemCode).itemId;
      this.imageUrl = null;
      this.objectService.getItemImage(itemId).subscribe(response => {
         if (response && response.length > 0) {
            this.imageUrl = "data:image/png;base64, " + response[0].imageSource;
            this.isImageModalOpen = true;
         }
      }, error => {
         console.error(error);
      })
   }

   /* #endregion */

   /* #region camera scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      try {
         this.scanActive = event;
         if (this.scanActive) {
            document.body.style.background = "transparent";
         }
      } catch (e) {
         console.error(e);
      }
   }

   async onDoneScanning(event) {
      try {
         if (event) {
            let itemFound = await this.validateBarcode(event);
            if (itemFound) {
               if (this.objectService.header.isWithSo) {
                  await this.runPackingEngine(itemFound, 1);
               } else {
                  await this.insertPackingLineWithoutSo(itemFound, 1);
               }
            } else {
               this.toastService.presentToast("Item Not Found", "", "top", "warning", 1000);
            }
         }
      } catch (e) {
         console.error(e);
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
         const alert = await this.alertController.create({
            cssClass: "custom-alert",
            header: "Are you sure to proceed?",
            buttons: [
               {
                  text: "Confirm",
                  cssClass: "success",
                  handler: async () => {
                     if (this.objectService.header.multiPackingId === 0) {
                        await this.insertObject();
                     } else {
                        await this.updateObject();
                     }
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
      } catch (e) {
         console.error(e);
      }
   }

   insertObject() {
      try {
         let newObjectDto = this.transformObjectToTrxDto(this.objectService.multiPackingObject);
         let checkFullComponentScan = this.checkAssemblyFullScan(this.objectService.multiPackingObject)
         if (!checkFullComponentScan) {
            this.toastService.presentToast("Insert Failed", "Component items are partially scan. Not allow to save.", "top", "warning", 1000);
            return;
         }
         if (this.allowDocumentWithEmptyLine == "N") {
            if (newObjectDto.details.length < 1) {
               this.toastService.presentToast("Insert Failed", "System unable to insert document without item line.", "top", "danger", 1000);
               return;
            }
         }
         this.objectService.insertObject(newObjectDto).subscribe(response => {
            if (response.status == 201) {
               let object = response.body as MultiPackingRoot;
               this.toastService.presentToast("Insert Complete", "New packing has been created.", "top", "success", 1000);
               this.objectService.resetVariables();
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.multiPackingId
                  }
               }
               this.navController.navigateRoot("/transactions/packing/packing-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   updateObject() {
      try {
         let updateObjectDto = this.transformObjectToTrxDto(this.objectService.multiPackingObject);
         let checkFullComponentScan = this.checkAssemblyFullScan(this.objectService.multiPackingObject)
         if (!checkFullComponentScan) {
            this.toastService.presentToast("Update Failed", "Component items are partially scan. Not allow to save.", "top", "warning", 1000);
            return;
         }
         if (this.allowDocumentWithEmptyLine === "N") {
            if (updateObjectDto.details.length < 1) {
               this.toastService.presentToast("Update Failed", "System unable to insert document without item line.", "top", "danger", 1000);
               return;
            }
         }
         this.objectService.updateObject(updateObjectDto).subscribe(response => {
            if (response.status == 201) {
               let object = response.body as MultiPackingRoot;
               this.toastService.presentToast("Update Complete", "Packing has been updated.", "top", "success", 1000);
               this.objectService.resetVariables();
               let navigationExtras: NavigationExtras = {
                  queryParams: {
                     objectId: object.header.multiPackingId
                  }
               }
               this.navController.navigateRoot("/transactions/packing/packing-detail", navigationExtras);
            }
         }, error => {
            console.error(error);
         });
      } catch (e) {
         console.error(e);
      }
   }

   previousStep() {
      // this.modalController.dismiss();
      try {
         this.navController.navigateBack("/transactions/packing/packing-header");
      } catch (e) {
         console.error(e);
      }
      // this.modalController.dismiss(this.filters);
   }

   transformObjectToTrxDto(multiPackingObject: MultiPackingObject): MultiPackingRoot {
      if (this.allowDocumentWithEmptyLine == "N") {
         multiPackingObject.packingCarton.forEach(carton => {
            carton.packList = carton.packList.filter(x => x.qtyPacked > 0);
         })
      }
      this.objectService.header.totalCarton = multiPackingObject.packingCarton.length;
      let trxDto: MultiPackingRoot = {
         header: this.objectService.header,
         details: multiPackingObject.packingCarton,
         otp: null,
         outstandingPackList: multiPackingObject.outstandingPackList
      };
      return trxDto;
   }

   checkAssemblyFullScan(multiPackingObject: MultiPackingObject) {
      let isFullScan: boolean = true;
      multiPackingObject.outstandingPackList.forEach(os => {
         if (os.isComponentScan && os.assembly && os.assembly.length > 0) {
            let qtyPossibleArray = os.assembly.map(x => x.qtyPossible);
            qtyPossibleArray = [...new Set(qtyPossibleArray)];
            if (qtyPossibleArray.length > 1) {
               isFullScan = false;
            }
         }
      })
      return isFullScan;
   }

   sendForDebug() {
      let trxDto = this.transformObjectToTrxDto(this.objectService.multiPackingObject);
      let jsonObjectString = JSON.stringify(trxDto);
      let debugObject: JsonDebug = {
         jsonDebugId: 0,
         jsonData: jsonObjectString
      };
      this.objectService.sendDebug(debugObject).subscribe(response => {
         if (response.status == 200) {
            this.toastService.presentToast("", "Debugging successful", "top", "success", 1000);
         }
      }, error => {
         this.toastService.presentToast("", "Debugging failure", "top", "warning", 1000);
         console.log(error);
      });
   }

}

