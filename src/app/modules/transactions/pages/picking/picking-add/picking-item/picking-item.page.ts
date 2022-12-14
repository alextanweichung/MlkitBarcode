import { Component, OnInit, ViewChild } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AlertController, IonAccordionGroup, NavController } from '@ionic/angular';
import { PickingSalesOrderDetail, PickingSalesOrderRoot } from 'src/app/modules/transactions/models/picking-sales-order';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { BarcodeScanInputService } from 'src/app/shared/services/barcode-scan-input.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { GoodsPickingHeader, GoodsPickingLine, GoodsPickingRoot, PickingSummary } from 'src/app/modules/transactions/models/picking';
import { TransactionDetail } from 'src/app/shared/models/transaction-detail';

@Component({
  selector: 'app-picking-item',
  templateUrl: './picking-item.page.html',
  styleUrls: ['./picking-item.page.scss'],
  providers: [BarcodeScanInputService, { provide: 'apiObject', useValue: 'mobilePicking' }]
})
export class PickingItemPage implements OnInit {

  objectHeader: GoodsPickingHeader;
  pickingSalesOrders: PickingSalesOrderRoot[] = [];
  moduleControl: ModuleControl[] = [];
  loadImage: boolean = true;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private commonService: CommonService,
    private pickingService: PickingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.objectHeader = this.pickingService.header;
    if (this.objectHeader === undefined) {
      this.navController.navigateBack('/transactions/picking/picking-sales-order');
    }
    this.pickingSalesOrders = this.pickingService.selectedSalesOrders;
    if (this.pickingSalesOrders && this.pickingSalesOrders.length > 0) {
      this.pickingSalesOrders.flatMap(r => r.details).flatMap(r => r.qtyPickedCurrent = 0);
    }
    this.loadImage = false; // this.configService.sys_parameter.loadImage;
    this.loadMasterList();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let loadImage = this.moduleControl.find(r => r.ctrlName === "LoadImage")?.ctrlValue;
      if (loadImage) {
        this.loadImage = loadImage === '1' ? true : false;
      }
    }, error => {
      console.log(error);
    })
  }

  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.pickingService.getMasterList().subscribe(response => {
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  /* #region  manual amend qty */

  onQtyChanged(event, soLine: PickingSalesOrderDetail, index: number) {
    if (Number.isInteger(event) && event >= 0) {
      if (this.objectHeader.isWithSo) {
        if (soLine.qtyPicked + event <= soLine.qtyRequest) {
          soLine.qtyPickedCurrent = event;
        } else {
          soLine.qtyPickedCurrent = soLine.qtyRequest - soLine.qtyPicked;
        }
      } else {
        soLine.qtyPickedCurrent = event;
        if (soLine.qtyPickedCurrent === 0) {
          this.deleteSoLine(index);
        }
      }
    }
  }

  /* #endregion */

  /* #region  sales order */

  @ViewChild('accordianGroup1', { static: false }) accordianGroup1: IonAccordionGroup; // use accordion value to determine if selectedSo 
  selectedSo: PickingSalesOrderRoot;
  setSelectedSo(so) {
    this.selectedSo = so;
  }

  /* #endregion */

  /* #region  barcode & check so */

  async validateBarcode(barcode: string) {
    if (barcode) {
      if (barcode && barcode.length > 12) {
        barcode = barcode.substring(0, 12);
      }
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
              discountPercent: found_item_master.discPct
            },
            itemVariationXId: found_barcode.xId,
            itemVariationYId: found_barcode.yId,
            itemSku: found_barcode.sku,
            itemBarcode: found_barcode.barcode
          }
          this.addItemToSo(outputData);
        } else {
          this.toastService.presentToast('Invalid Barcode', '', 'middle', 'danger', 1000);
        }
      }
    }
  }

  async onItemAdd(event: TransactionDetail) {
    await this.addItemToSo(event);
  }

  selectedSoDetail: PickingSalesOrderDetail;
  async addItemToSo(trxLine: TransactionDetail) {
    if (this.objectHeader.isWithSo && this.accordianGroup1.value === undefined) {
      this.toastService.presentToast('Please select SO', '', 'middle', 'medium', 1000);
      return;
    }
    if (this.objectHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
      let itemIndex = this.selectedSo.details.findIndex(r => r.itemSku === trxLine.itemSku);
      if (itemIndex > -1) {
        this.selectedSoDetail = this.selectedSo.details[itemIndex];
        this.selectedSoDetail.qtyPickedCurrent += 1;
        this.onQtyChanged(this.selectedSoDetail.qtyPickedCurrent, this.selectedSoDetail, itemIndex);
      } else {
        this.toastService.presentToast('Item not found in this SO', '', 'middle', 'medium', 1000);
      }
    }
    if (!this.objectHeader.isWithSo) {
      if (this.pickingSalesOrders && this.pickingSalesOrders.length === 0) {
        this.pickingSalesOrders.push({
          header: null,
          details: [],
          pickingHistory: []
        })
      }
      if (this.pickingSalesOrders[0].details.findIndex(r => r.itemSku === trxLine.itemSku) === 0) { // already in and first one
        this.selectedSoDetail = this.pickingSalesOrders[0].details.find(r => r.itemSku === trxLine.itemSku);
        this.selectedSoDetail.qtyPickedCurrent++;
      } else {
        let d: PickingSalesOrderDetail = {
          salesOrderId: null,
          itemId: trxLine.itemId,
          description: trxLine.description,
          itemVariationXId: trxLine.itemVariationXId,
          itemVariationYId: trxLine.itemVariationYId,
          itemSku: trxLine.itemSku,
          itemVariationTypeCode: trxLine.variationTypeCode,
          itemCode: trxLine.itemCode,
          itemVariationXDescription: trxLine.itemVariationXId ? this.itemVariationXMasterList.find(r => r.id === trxLine.itemVariationXId).description : null,
          itemVariationYDescription: trxLine.itemVariationYId ? this.itemVariationYMasterList.find(r => r.id === trxLine.itemVariationYId).description : null,
          itemUomId: null,
          itemUomDescription: null,
          rack: null,
          subRack: null,
          qtyRequest: 0,
          qtyCommit: 0,
          qtyBalance: 0,
          qtyPicked: 0,
          qtyPickedCurrent: 1,
          qtyPacked: 0
        }
        await this.pickingSalesOrders[0].details.length > 0 ? this.pickingSalesOrders[0].details.unshift(d) : this.pickingSalesOrders[0].details.push(d);
      }
    }
  }

  async deleteSoLine(index) {
    if (this.pickingSalesOrders[0]?.details[index]) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Delete this item?',
        message: 'This action cannot be undone.',
        buttons: [
          {
            text: 'Delete item',
            cssClass: 'danger',
            handler: async () => {
              this.pickingSalesOrders[0].details.splice(index, 1);
              this.toastService.presentToast('Item removed.', '', 'middle', 'success', 1000);
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
      this.toastService.presentToast('Something went wrong!', '', 'middle', 'danger', 1000);
    }
  }

  /* #endregion */

  /* #region  barcode scanner */

  scanActive: boolean = false;
  async startScanning() {
    if (this.objectHeader.isWithSo && this.selectedSo && this.accordianGroup1.value !== undefined) {
      const allowed = await this.checkPermission();
      if (allowed) {
        this.scanActive = true;
        document.body.style.background = "transparent";
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          let barcode = result.content;
          this.scanActive = false;
          await this.validateBarcode(barcode);
        }
      }
    } else if (this.objectHeader.isWithSo && !this.selectedSo && this.accordianGroup1.value === undefined) {
      this.toastService.presentToast('Please select 1 SO', '', 'middle', 'medium', 1000);
    }
    if (!this.objectHeader.isWithSo) {
      const allowed = await this.checkPermission();
      if (allowed) {
        this.scanActive = true;
        document.body.style.background = "transparent";
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          let barcode = result.content;
          this.scanActive = false;
          await this.validateBarcode(barcode);
        }
      }
    }
  }

  async checkPermission() {
    return new Promise(async (resolve) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        const alert = await this.alertController.create({
          header: "No permission",
          message: "Please allow camera access in your setting",
          buttons: [
            {
              text: "No",
              role: "cancel"
            },
            {
              text: "Open Settings",
              handler: () => {
                BarcodeScanner.openAppSettings();
                resolve(false);
              }
            }
          ]
        })
        await alert.present();
      } else {
        resolve(false);
      }
    });
  }

  stopScanner() {
    BarcodeScanner.stopScan();
    this.scanActive = false;
  }

  /* #endregion */

  async nextStep() {
    let soLines: PickingSalesOrderDetail[] = this.pickingSalesOrders.flatMap(r => r.details).filter(r => r.qtyPickedCurrent > 0);
    if (soLines.length > 0) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'OK',
            role: 'confirm',
            cssClass: 'success',
            handler: async () => {
              await this.insertPicking(soLines);
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'middle', 'danger', 1000);
    }
  }

  insertPicking(soLines: any) {
    let object: GoodsPickingRoot;
    let lines: GoodsPickingLine[] = [];
    soLines.forEach(r => {
      lines.push({
        pickingLineId: 0,
        pickingId: 0,
        salesOrderId: r.salesOrderId,
        itemId: r.itemId,
        itemVariationXId: r.itemVariationXId,
        itemVariationYId: r.itemVariationYId,
        itemSku: r.itemSku,
        itemBarcode: this.configService.item_Barcodes.find(rr => rr.sku === r.itemSku)?.barcode,
        itemUomId: r.itemUomId,
        qtyRequest: r.qtyPickedCurrent,
        soRowIndex: this.objectHeader.isWithSo ? (this.pickingSalesOrders.flatMap(rr => rr.details).findIndex(rr => rr.salesOrderId === r.salesOrderId && rr.itemSku === r.itemSku)) : null,
        sequence: lines.length,
        locationId: this.objectHeader.locationId
      })
    })
    let header: GoodsPickingHeader = {
      pickingId: 0,
      pickingNum: '',
      trxDate: this.objectHeader.trxDate,
      locationId: this.objectHeader.locationId,
      toLocationId: this.objectHeader.toLocationId,
      customerId: this.objectHeader.customerId,
      warehouseAgentId: this.objectHeader.warehouseAgentId,
      businessModelType: this.objectHeader.businessModelType,
      sourceType: 'M',
      isWithSo: this.objectHeader.isWithSo,
      remark: this.objectHeader.remark,
      typeCode: this.objectHeader.typeCode
    }
    object = {
      header: header,
      details: lines
    }
    this.pickingService.insertPicking(object).subscribe(response => {
      if (response.status === 201) {
        let ps: PickingSummary = {
          pickingNum: response.body["header"]["pickingNum"],
          customerId: response.body["header"]["customerId"],
          locationId: response.body["header"]["locationId"],
          trxDate: response.body["header"]["trxDate"]
        }        
        this.pickingService.setPickingSummary(ps);
        this.toastService.presentToast('Picking has been added', '', 'middle', 'success', 1000);
        this.navController.navigateForward('/transactions/picking/picking-summary');
      }
    }, error => {
      console.log(error);
    })
  }

  previousStep() {
    this.navController.navigateBack('/transactions/picking/picking-sales-order');
  }

}
