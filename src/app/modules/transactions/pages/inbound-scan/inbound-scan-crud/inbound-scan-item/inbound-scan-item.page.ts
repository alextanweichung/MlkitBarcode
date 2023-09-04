import { Component, OnInit, ViewChild } from '@angular/core';
import { IonPopover, NavController, ViewDidEnter } from '@ionic/angular';
import { InboundScanCurrentScanList, InboundScanDetailWithDoc, InboundScanDocDetail, InboundScanOutstandingScanList } from 'src/app/modules/transactions/models/inbound-scan';
import { InboundScanService } from 'src/app/modules/transactions/services/inbound-scan.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';

@Component({
  selector: 'app-inbound-scan-item',
  templateUrl: './inbound-scan-item.page.html',
  styleUrls: ['./inbound-scan-item.page.scss'],
})
export class InboundScanItemPage implements OnInit, ViewDidEnter {

  showItemList: boolean = false;
  
  constructor(
    public objectService: InboundScanService,
    private authService: AuthService,
    private toastService: ToastService,
    private navController: NavController
  ) { }

  @ViewChild('barcodescaninput', { static: false }) barcodescaninput: BarcodeScanInputPage;
  ionViewDidEnter(): void {
    try {
      this.barcodescaninput.setFocus();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    this.loadModuleControl();
    this.transformDoc();
  }

  moduleControl: ModuleControl[] = [];
  allowDocumentWithEmptyLine: string = "N";
  systemWideScanningMethod: string;
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  inboundQtyControl: boolean = false;
  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
      if (config != undefined) {
        this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
      }
      let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
      if (ignoreCheckdigit != undefined) {
        this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
      let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
      if (scanningMethod != undefined) {
        this.systemWideScanningMethod = scanningMethod.ctrlValue;
      }
      let scanControl = this.moduleControl.find(x => x.ctrlName === "InboundScanQtyControl");
      if (scanControl != undefined) {
        this.inboundQtyControl = scanControl.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
    })
  }

  docDetailObject: InboundScanDetailWithDoc = {
    documentId: null,
    documentNum: null,
    outstandingScanList: [],
    currentScanList: [],
    scanHistory: []
  };
  transformDoc() {
    console.log("🚀 ~ file: inbound-scan-item.page.ts:75 ~ InboundScanItemPage ~ transformDoc ~ this.objectService.object:", this.objectService.object)
    if (this.objectService.object.header.isWithDoc) {
      if (this.objectService.doc != null) {
        let x = this.objectService.doc;
        var interTransferId = x.header.interTransferId;
        var outstandingItemArray = [];
        x.details.forEach(detail => {
          let outstandingItem: InboundScanOutstandingScanList = {
            documentId: detail.interTransferId,
            documentLineId: detail.interTransferLineId, 
            itemId: detail.itemId,
            itemCode: detail.itemCode,
            itemVariationXId: detail.itemVariationXId,
            itemVariationYId: detail.itemVariationYId,
            itemVariationXDescription: detail.itemVariationXDescription,
            itemVariationYDescription: detail.itemVariationYDescription,
            itemUomId: null,
            itemSku: detail.itemSku,
            rack: null,
            subRack: null,
            qtyRequest: detail.qtyRequest,
            qtyScanned: detail.qtyScanned,
            qtyScannedCurrent: 0
          }
          outstandingItemArray.push(outstandingItem)
        })
        let pickList: InboundScanDetailWithDoc = {
          documentId: interTransferId,
          documentNum: x.header.interTransferNum,
          outstandingScanList: outstandingItemArray,
          currentScanList: [],
          scanHistory: []
        }
        this.docDetailObject = pickList;
      }
    }      
  }

  async onItemAdd(event: TransactionDetail[]) {
    try {
      if (event) {
        if (this.objectService.object.header.isWithDoc) {
          event.forEach(async r => {
            await this.runScanningEngine(r, 1);
          })
        } else {
          event.forEach(async r => {
            await this.insertInboundScanLineWithoutDoc(r, 1);
          })
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  runScanningEngine(itemFound: TransactionDetail, inputQty: number) {
    let itemAvailable: boolean = false;
    let qtyAvailable: boolean = true;
    let scanListIndex: number;

    console.log("🚀 ~ file: inbound-scan-item.page.ts:163 ~ InboundScanItemPage ~ this.docDetailObject.outstandingScanList.forEach ~ :", this.docDetailObject.outstandingScanList)

    //Loop docDetailObject and look for item with same SKU. If Item is found, set the itemAvailable flag to 'Y' and increase the qtyScanned counter
    this.docDetailObject.outstandingScanList.forEach((element, index) => {
      if (element.itemSku === itemFound.itemSku) {
        itemAvailable = true;
        scanListIndex = index;
        //When enable inbound scanning qty control, do not allow over scanning
        if (this.inboundQtyControl) {
          if ((element.qtyScanned + element.qtyScannedCurrent + inputQty) <= element.qtyRequest) {
            element.qtyScannedCurrent = element.qtyScannedCurrent + inputQty;
          } else {
            qtyAvailable = false;
          }
        } else {
          //For Sales Return, can only scan for those item in the document              
          if (this.objectService.object.header.isWithDoc && this.objectService.object.header.typeCode === 'S') {
            if ((element.qtyScanned + element.qtyScannedCurrent + inputQty) <= element.qtyRequest) {
              element.qtyScannedCurrent = element.qtyScannedCurrent + inputQty;
            } else {
              qtyAvailable = false;
            }
          } else {
            element.qtyScannedCurrent = element.qtyScannedCurrent + inputQty;
          }
        }
      }
    });
    //Bypass Item checking when there inbound control is turned off
    if (!this.inboundQtyControl) {
      itemAvailable = true;
    }

    //if item and qty is available, add scanned item into current picked list
    if (itemAvailable) {
      if (qtyAvailable) {
        if (this.docDetailObject.currentScanList.length > 0 && itemFound.itemBarcode == this.docDetailObject.currentScanList[0].itemBarcode) {
          this.docDetailObject.currentScanList[0].qtyScanned += inputQty;
        } else {
          let newLine = this.assignItemFoundToNewLine(itemFound, inputQty, scanListIndex);
          //Add scanned item into first index of the array
          this.docDetailObject.currentScanList.unshift(newLine);
        }
      } else {
        this.toastService.presentToast("", "Not allow to add item more than document quantity.", "top", "warning", 1000);
      }
    } else {
      this.toastService.presentToast("", "Item is not available in the selected document.", "top", "warning", 1000);
    }
  }
  
  assignItemFoundToNewLine(itemFound: TransactionDetail, inputQty: number, docRowIndex?: number){
    let newLine: InboundScanCurrentScanList = {
      inboundScanLineId: 0,
      inboundScanId: 0,        
      itemId: itemFound.itemId,        
      itemCode: itemFound.itemCode,
      itemVariationXId: itemFound.itemVariationXId,
      itemVariationYId: itemFound.itemVariationYId,
      itemVariationXDescription: this.objectService.itemVariationXMasterList.find(r => r.id === itemFound.itemVariationXId)?.description,
      itemVariationYDescription: this.objectService.itemVariationYMasterList.find(r => r.id === itemFound.itemVariationYId)?.description,
      itemSku: itemFound.itemSku,
      itemUomId: itemFound.itemUomId,
      itemBarcode: itemFound.itemBarcode,
      docRowIndex: (docRowIndex || docRowIndex == 0) ? docRowIndex : null,
      description: itemFound.description,
      qtyScanned: inputQty,
      sequence: 0,
      lineUDDate: null,
      masterUDGroup1: this.objectService.object.header.masterUDGroup1 ? this.objectService.object.header.masterUDGroup1 : null,
      masterUDGroup2: this.objectService.object.header.masterUDGroup2 ? this.objectService.object.header.masterUDGroup2 : null,
      masterUDGroup3: this.objectService.object.header.masterUDGroup3 ? this.objectService.object.header.masterUDGroup3 : null,
      locationId: this.objectService.object.header.toLocationId ? this.objectService.object.header.toLocationId : null,
      deactivated: false,
      documentId: this.objectService.object.header.docId,
    }    
    return newLine;
  }

  insertInboundScanLineWithoutDoc(itemFound: TransactionDetail, inputQty: number) {
    if (this.objectService.object.details === null) {
      this.objectService.object.details = [];
    }
    let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
    this.objectService.object.details.push(newLine);
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  previousStep() {
    try {
      this.navController.navigateBack('/transactions/inbound-scan/inbound-scan-header');
    } catch (e) {
      console.error(e);
    }
  }

  /* #region for web testing */

  itemSearchValue: string;
  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.objectService.validateBarcode(this.itemSearchValue).subscribe(async response => {
        console.log("🚀 ~ file: inbound-scan-item.page.ts:262 ~ InboundScanItemPage ~ this.objectService.validateBarcode ~ response:", response)
        this.itemSearchValue = null;
        if (response) {
          if (this.objectService.object.header.isWithDoc) {
            await this.runScanningEngine(response, Number(1));
          } else {
            await this.insertInboundScanLineWithoutDoc(response, Number(1));
          }
        }
      }, error => {
        console.error(error);
      })
    event.preventDefault();
    }
  }

  /* #endregion */

}
