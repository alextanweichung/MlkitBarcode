import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonPopover, ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';
import { CurrentPickList, MultiPickingCarton, MultiPickingObject, MultiPickingOutstandingPickList, MultiPickingRoot, PickingLineVariation } from 'src/app/modules/transactions/models/picking';
import { NavigationExtras } from '@angular/router';
import { BarcodeScanInputPage } from 'src/app/shared/pages/barcode-scan-input/barcode-scan-input.page';

@Component({
  selector: 'app-picking-item',
  templateUrl: './picking-item.page.html',
  styleUrls: ['./picking-item.page.scss'],
  providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobilePicking' }]
})
export class PickingItemPage implements OnInit, ViewDidEnter {

  @ViewChild('barcodescaninput', { static: false }) barcodescaninput: BarcodeScanInputPage;
  systemWideEAN13IgnoreCheckDigit: boolean = false;
  showItemList: boolean = false;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    public objectService: PickingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
    private modalController: ModalController
  ) { }

  ionViewDidEnter(): void {
    try {
      this.barcodescaninput.setFocus();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    this.loadModuleControl();
    if (this.objectService.multiPickingObject.pickingCarton.length === 0) {
      this.addCarton();
    } else {
      this.selectedCartonNum = this.objectService.multiPickingObject.pickingCarton[0].cartonNum;
    }
  }

  moduleControl: ModuleControl[] = [];
  allowDocumentWithEmptyLine: string = "N";
  pickingQtyControl: string = "0";
  systemWideScanningMethod: string;
  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let config = this.moduleControl.find(x => x.ctrlName === "AllowDocumentWithEmptyLine");
      if (config != undefined) {
        this.allowDocumentWithEmptyLine = config.ctrlValue.toUpperCase();
      }
      let pickingControl = this.moduleControl.find(x => x.ctrlName === "PickingQtyControl");
      if (pickingControl != undefined) {
        this.pickingQtyControl = pickingControl.ctrlValue;
      }
      let ignoreCheckdigit = this.moduleControl.find(x => x.ctrlName === "SystemWideEAN13IgnoreCheckDigit");
      if (ignoreCheckdigit != undefined) {
        this.systemWideEAN13IgnoreCheckDigit = ignoreCheckdigit.ctrlValue.toUpperCase() == "Y" ? true : false;
      }
      let scanningMethod = this.moduleControl.find(x => x.ctrlName === "SystemWideScanningMethod");
      if (scanningMethod != undefined) {
        this.systemWideScanningMethod = scanningMethod.ctrlValue;
      }
    })
  }

  /* #region picking engine */

  runPickingEngine(itemFound: TransactionDetail, inputQty: number) {
    if (itemFound) {
      let outstandingLines = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.itemSku == itemFound.itemSku);
      if (outstandingLines.length > 0) {
        let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
        let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
        let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
        let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
        switch (this.pickingQtyControl.toUpperCase()) {
          //No control
          case "N":
            this.insertPickingLine(itemFound, inputQty, outstandingLines, "N");
            break;
          //Not allow pick quantity more than SO quantity
          case "Y":
            if (osTotalAvailableQty >= inputQty) {
              this.insertPickingLine(itemFound, inputQty, outstandingLines, "Y");
              let totalQtyCurrent = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyCurrent, 0);
              let totalQtyPicked = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyPicked, 0);
              let totalQtyRequest = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyRequest, 0);
              if (totalQtyCurrent + totalQtyPicked == totalQtyRequest) {
                this.toastService.presentToast("Complete Notification", "Scanning for selected SO is completed.", "top", "success", 1000);
              }
            } else {
              this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
              // this.barcodeScan.setInputFocus();
            }
            break;
        }
      } else {
        this.toastService.presentToast("Control Validation", "Item is not available in the selected Sales Order.", "top", "warning", 1000);
        // this.barcodeScan.setInputFocus();
      }
    } else {
      this.toastService.presentToast("Control Validation", "Invalid Item Barcode", "top", "warning", 1000);
    }
  }

  insertPickingLine(itemFound: TransactionDetail, inputQty: number, outstandingLines: MultiPickingOutstandingPickList[], pickingQtyControl: string) {
    // When scanning the same item, add the quantity to first line, instead of adding new row
    let pickingCartonTag = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
    if (pickingCartonTag.pickList.length > 0 && itemFound.itemBarcode == pickingCartonTag?.pickList[0]?.itemBarcode) {
      let firstPickingLine = pickingCartonTag.pickList[0];
      firstPickingLine.qtyPicked += inputQty;
    } else {
      let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
      newLine.cartonNum = pickingCartonTag.cartonNum;
      pickingCartonTag.pickList.unshift(newLine);
    }
    // Filter out currentPickList with same item
    let pickListLines = this.objectService.multiPickingObject.pickingCarton.flatMap(x => x.pickList).filter(x => x.itemSku == itemFound.itemSku);
    this.computePickingAssignment(inputQty, outstandingLines, pickListLines);
    // this.setDataEntryState();
    // this.objectForm.markAsDirty();
    // this.barcodeScan.setInputFocus();
  }

  assignItemFoundToNewLine(itemFound: any, inputQty: number) {
    let newLine: CurrentPickList = {
      multiPickingLineId: 0,
      multiPickingId: this.objectService.header.multiPickingId,
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
      qtyPicked: inputQty,
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
    return newLine;
  }

  computePickingAssignment(inputQty: number, outstandingLines: MultiPickingOutstandingPickList[], currentPickListLines: CurrentPickList[]) {
    // Update left side qtyCurrent
    for (let os of outstandingLines) {
      let availableQty = os.qtyRequest - os.qtyPicked - os.qtyCurrent;
      if (availableQty >= inputQty) {
        os.qtyCurrent += inputQty;
        inputQty = 0;
      } else {
        os.qtyCurrent += availableQty;
        inputQty -= availableQty
      }
    }
    // This condition only applies to picking without control. User will be able to overscan  
    if (inputQty != 0) {
      outstandingLines[0].qtyCurrent += inputQty;
      inputQty = 0;
    }
    this.mapPickingAssignment(outstandingLines, currentPickListLines);
  }

  mapPickingAssignment(outstandingLines: MultiPickingOutstandingPickList[], currentPickListLines: CurrentPickList[]) {
    currentPickListLines.forEach(x => {
      x.variations = [];
    })
    currentPickListLines.reverse();
    let duplicateOutstandingLines = JSON.parse(JSON.stringify(outstandingLines));
    currentPickListLines.forEach(current => {
      let balanceQty: number = current.qtyPicked;
      let rightLoopCount: number = 0;
      for (let os of duplicateOutstandingLines) {
        let currentPickAssignment: PickingLineVariation = {
          qtyPicked: os.qtyCurrent,
          salesOrderId: os.salesOrderId,
          salesOrderLineId: os.salesOrderLineId,
          salesOrderVariationId: os.salesOrderVariationId
        }
        if (balanceQty != 0) {
          if (balanceQty == os.qtyCurrent) {
            currentPickAssignment.qtyPicked = balanceQty;
            current.variations.push(currentPickAssignment);
            duplicateOutstandingLines.shift();
            balanceQty = 0;
            break;
          }
          else if (balanceQty > os.qtyCurrent) {
            currentPickAssignment.qtyPicked = os.qtyCurrent;
            current.variations.push(currentPickAssignment);
            balanceQty -= os.qtyCurrent;
            rightLoopCount++;
          }
          else if (balanceQty < os.qtyCurrent) {
            currentPickAssignment.qtyPicked = balanceQty;
            current.variations.push(currentPickAssignment);
            os.qtyCurrent -= balanceQty;
            balanceQty = 0;
          }
        }
      }
      if (rightLoopCount > 0) {
        duplicateOutstandingLines.splice(0, rightLoopCount);
      }
    })
  }

  insertPickingLineWithoutSo(itemFound: TransactionDetail, inputQty: number) {
    let pickingCartonTag = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
    if (pickingCartonTag.pickList.length > 0 && itemFound.itemBarcode == pickingCartonTag?.pickList[0]?.itemBarcode) {
      let firstPickingLine = pickingCartonTag.pickList[0];
      firstPickingLine.qtyPicked += inputQty;
    } else {
      let newLine = this.assignItemFoundToNewLine(itemFound, inputQty);
      newLine.cartonNum = pickingCartonTag.cartonNum;
      pickingCartonTag.pickList.unshift(newLine);
    }
  }

  /* #endregion */

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

  /* #region carton segment */

  selectedCartonNum: number = 0;
  addCarton() {
    let nextCartonNum = this.objectService.multiPickingObject.pickingCarton.length > 0 ? this.objectService.multiPickingObject.pickingCarton[0].cartonNum + 1 : 1;
    let newPickList: CurrentPickList[] = [];
    let newCarton: MultiPickingCarton = {
      cartonNum: nextCartonNum,
      pickList: newPickList
    };
    this.objectService.multiPickingObject.pickingCarton.unshift(newCarton);
    this.selectedCartonNum = nextCartonNum;
  }

  async deleteCarton() {
    try {
      if (this.selectedCartonNum) {
        const alert = await this.alertController.create({
          cssClass: 'custom-alert',
          header: 'Are you sure to delete?',
          subHeader: 'Changes made will be discard.',
          buttons: [
            {
              text: 'OK',
              role: 'confirm',
              cssClass: 'danger',
              handler: async () => {
                if (this.objectService.header.isWithSo) {
                  await this.objectService.multiPickingObject.pickingCarton.find(r => Number(this.selectedCartonNum) === Number(r.cartonNum)).pickList.forEach(item => {
                    this.resetOutstandingListQuantityCurrent(item);
                  })
                  this.objectService.multiPickingObject.pickingCarton = this.objectService.multiPickingObject.pickingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                } else {
                  this.objectService.multiPickingObject.pickingCarton = this.objectService.multiPickingObject.pickingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum));
                }
                this.selectedCartonNum = this.objectService.multiPickingObject.pickingCarton.length > 0 ? this.objectService.multiPickingObject.pickingCarton[0].cartonNum : null;
              },
            },
            {
              text: 'Cancel',
              role: 'cancel',
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

  async deleteCartonLine(rowIndex: number, item: CurrentPickList) {
    try {
      if (this.selectedCartonNum) {
        const alert = await this.alertController.create({
          cssClass: 'custom-alert',
          header: 'Are you sure to delete?',
          subHeader: 'Changes made will be discard.',
          buttons: [
            {
              text: 'OK',
              role: 'confirm',
              cssClass: 'danger',
              handler: async () => {
                if (this.objectService.header.isWithSo) {
                  this.resetOutstandingListQuantityCurrent(item);
                  let pickingCartonTag = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum));
                  let rowIndex = pickingCartonTag.pickList.findIndex(x => x == item);
                  pickingCartonTag.pickList.splice(rowIndex, 1);
                  pickingCartonTag.pickList = [...pickingCartonTag.pickList];
                } else {
                  this.objectService.multiPickingObject.pickingCarton = this.objectService.multiPickingObject.pickingCarton.filter(r => Number(r.cartonNum) !== Number(this.selectedCartonNum)).splice(rowIndex, 1);
                }
              },
            },
            {
              text: 'Cancel',
              role: 'cancel',
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

  resetOutstandingListQuantityCurrent(item: CurrentPickList) {
    if (item.variations) {
      item.variations.forEach(inner => {
        let findOs = this.objectService.multiPickingObject.outstandingPickList.find(x => x.salesOrderVariationId == inner.salesOrderVariationId);
        if (findOs) {
          findOs.qtyCurrent -= inner.qtyPicked;
        }
      })
    }
  }

  getCartonItems() {
    if (Number(this.selectedCartonNum) > 0) {
      return this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList;
    }
    return [];
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
              variationTypeCode: found_item_master.varCd,
              discountGroupCode: found_item_master.discCd,
              discountExpression: found_item_master.discPct + '%',
              taxId: found_item_master.taxId,
              taxCode: found_item_master.taxCd,
              taxPct: found_item_master.taxPct,
              qtyRequest: null,
              itemPricing: {
                itemId: found_item_master.id,
                unitPrice: found_item_master.price,
                discountGroupCode: found_item_master.discCd,
                discountExpression: found_item_master.discPct + '%',
                discountPercent: found_item_master.discPct,
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
            this.toastService.presentToast('', 'Barcode not found.', 'top', 'danger', 1000);
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
      if (this.objectService.multiPickingObject.pickingCarton.length === 0) {
        this.toastService.presentToast("Control Validation", "Please create carton before adding items.", "top", "warning", 1000);
      } else {
        this.objectService.validateBarcode(this.itemSearchValue).subscribe(async response => {
          this.itemSearchValue = null;
          if (response) {
            if (this.objectService.header.isWithSo) {
              await this.runPickingEngine(response, Number(1));
            } else {
              await this.insertPickingLineWithoutSo(response, Number(1));
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
      if (this.objectService.multiPickingObject.pickingCarton.length === 0) {
        this.toastService.presentToast("Control Validation", "Please create carton before adding items.", "top", "warning", 1000);
      } else {
        if (event) {
          if (this.objectService.header.isWithSo) {
            event.forEach(async r => {
              await this.runPickingEngine(r, 1);
            })
          } else {
            event.forEach(async r => {
              await this.insertPickingLineWithoutSo(r, 1);
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

  async editCartonLine(item: CurrentPickList) {
    this.clonePickingQty(item);
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      backdropDismiss: false,
      header: 'Enter Quantity',
      inputs: [
        {
          name: 'inputQty',
          type: 'number',
          placeholder: 'Enter Quantity',
          value: Number(item.qtyPicked),
          min: 1
        }
      ],
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          cssClass: 'success',
          handler: async (data) => {
            item.qtyPicked = Number(data.inputQty);
            this.updatePickingQty(item);
          },
        },
        {
          text: 'Cancel',
          role: 'cancel'
        },
      ],
    });
    await alert.present();
  }

  clonedQty: { [s: number]: CurrentPickList } = {};
  clonePickingQty(item: CurrentPickList) {
    let rowIndex = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList.findIndex(x => x == item);
    this.clonedQty[rowIndex] = { ...item };
  }

  updatePickingQty(item: CurrentPickList) {
    let outstandingLines = this.objectService.multiPickingObject.outstandingPickList.filter(x => x.itemSku == item.itemSku);
    let pickListLines = this.objectService.multiPickingObject.pickingCarton.flatMap(x => x.pickList).filter(x => x.itemSku == item.itemSku);
    let rowIndex = this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList.findIndex(x => x == item);
    let inputQty: number = item.qtyPicked - this.clonedQty[rowIndex].qtyPicked
    if (outstandingLines.length > 0) {
      let osTotalQtyRequest = outstandingLines.reduce((sum, current) => sum + current.qtyRequest, 0);
      let osTotalQtyPicked = outstandingLines.reduce((sum, current) => sum + current.qtyPicked, 0);
      let osTotalQtyCurrent = outstandingLines.reduce((sum, current) => sum + current.qtyCurrent, 0);
      let osTotalAvailableQty = osTotalQtyRequest - osTotalQtyPicked - osTotalQtyCurrent;
      switch (this.pickingQtyControl) {
        //No control
        case "N":
          this.resetOutstandingListQuantityCurrent(item);
          this.computePickingAssignment(item.qtyPicked, outstandingLines, pickListLines);
          break;
        //Not allow pack quantity more than SO quantity
        case "Y":
          if (osTotalAvailableQty >= inputQty) {
            this.resetOutstandingListQuantityCurrent(item);
            this.computePickingAssignment(item.qtyPicked, outstandingLines, pickListLines);
            let totalQtyCurrent = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyCurrent, 0);
            let totalQtyPacked = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyPicked, 0);
            let totalQtyRequest = this.objectService.multiPickingObject.outstandingPickList.reduce((sum, current) => sum + current.qtyRequest, 0);
            if (totalQtyCurrent + totalQtyPacked == totalQtyRequest) {
              this.toastService.presentToast("Control Validation", "Scanning for selected SO is completed.", "top", "success", 1000);
            }
          } else {
            this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList[rowIndex] = this.clonedQty[rowIndex];
            this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList = [...this.objectService.multiPickingObject.pickingCarton.find(r => Number(r.cartonNum) === Number(this.selectedCartonNum)).pickList];
            this.toastService.presentToast("Control Validation", "Input quantity exceeded SO quantity.", "top", "warning", 1000);
          }
          break;
      }
    } else {
      this.toastService.presentToast("Data Error", "Matching outstanding list not found.", "top", "warning", 1000);
    }
    delete this.clonedQty[rowIndex];
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
    let itemId = this.objectService.multiPickingObject.outstandingPickList.find(r => r.itemCode === itemCode).itemId;
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
            await this.runPickingEngine(itemFound, 1);
          } else {
            await this.insertPickingLineWithoutSo(itemFound, 1);
          }
        } else {
          this.toastService.presentToast("Item Not Found", "", "top", "warning", 1000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  async nextStep() {
    console.log("🚀 ~ file: picking-item.page.ts:637 ~ PickingItemPage ~ handler: ~ this.objectService.header:", this.objectService.header)
    try {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'Confirm',
            cssClass: 'success',
            handler: async () => {
              if (this.objectService.header.multiPickingId === 0) {
                await this.insertObject();
              } else {
                await this.updateObject();
              }
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
    } catch (e) {
      console.error(e);
    }
  }

  insertObject() {
    try {
      let newObjectDto = this.transformObjectToTrxDto(this.objectService.multiPickingObject);
      console.log("🚀 ~ file: picking-item.page.ts:660 ~ PickingItemPage ~ insertObject ~ newObjectDto:", newObjectDto)
      if (this.allowDocumentWithEmptyLine == "N") {
        if (newObjectDto.details.length < 1) {
          this.toastService.presentToast("Insert Failed", "System unable to insert document without item line.", "top", "danger", 1000);
          return;
        }
      }
      this.objectService.insertObject(newObjectDto).subscribe(response => {
        if (response.status == 201) {
          let object = response.body as MultiPickingRoot;
          this.toastService.presentToast("Insert Complete", "New picking has been created.", "top", "success", 1000);
          this.objectService.resetVariables();
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: object.header.multiPickingId
            }
          }
          this.navController.navigateRoot("/transactions/picking/picking-detail", navigationExtras);
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
      let updateObjectDto = this.transformObjectToTrxDto(this.objectService.multiPickingObject);
      console.log("🚀 ~ file: picking-item.page.ts:689 ~ PickingItemPage ~ updateObject ~ objectDto:", updateObjectDto)
      if (this.allowDocumentWithEmptyLine === "N") {
        if (updateObjectDto.details.length < 1) {
          this.toastService.presentToast("Update Failed", "System unable to insert document without item line.", "top", "danger", 1000);
          return;
        }
      }
      this.objectService.updateObject(updateObjectDto).subscribe(response => {
        if (response.status == 201) {
          let object = response.body as MultiPickingRoot;
          this.toastService.presentToast("Update Complete", "Picking has been updated.", "top", "success", 1000);
          this.objectService.resetVariables();
          let navigationExtras: NavigationExtras = {
            queryParams: {
              objectId: object.header.multiPickingId
            }
          }
          this.navController.navigateRoot("/transactions/picking/picking-detail", navigationExtras);
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
      this.navController.navigateBack('/transactions/picking/picking-header');
    } catch (e) {
      console.error(e);
    }
    // this.modalController.dismiss(this.filters);
  }

  transformObjectToTrxDto(multiPickingObject: MultiPickingObject): MultiPickingRoot {
    if (this.allowDocumentWithEmptyLine == 'N') {
      multiPickingObject.pickingCarton.forEach(carton => {
        carton.pickList = carton.pickList.filter(x => x.qtyPicked > 0);
      })
    }
    this.objectService.header.totalCarton = multiPickingObject.pickingCarton.length;
    let trxDto: MultiPickingRoot = {
      header: this.objectService.header,
      details: multiPickingObject.pickingCarton,
      otp: null,
      outstandingPickList: multiPickingObject.outstandingPickList
    };
    return trxDto;
  }

}
