import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { GoodsPackingHeader, GoodsPackingLine, GoodsPackingRoot, GoodsPackingSummary } from 'src/app/modules/transactions/models/packing';
import { PackingSalesOrderDetail, PackingSalesOrderRoot } from 'src/app/modules/transactions/models/packing-sales-order';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-packing-confirmation',
  templateUrl: './packing-confirmation.page.html',
  styleUrls: ['./packing-confirmation.page.scss'],
})
export class PackingConfirmationPage implements OnInit {

  header: GoodsPackingHeader;
  packingSalesOrders: PackingSalesOrderRoot[] = [];
  packingSalesOrderLines: PackingSalesOrderDetail[] = [];
  moduleControl: ModuleControl[] = [];
  loadImage: boolean = true;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private packingService: PackingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.header = this.packingService.header;
    if (this.header === undefined) {
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/transactions/packing/packing-sales-order');
    }
    this.packingSalesOrders = this.packingService.selectedSalesOrders;
    this.packingSalesOrderLines = this.packingService.selectedSalesOrderLines;
    this.loadModuleControl();
    this.loadImage = this.configService.sys_parameter.loadImage;
    this.loadMasterList();
  }

  loadModuleControl() {
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      // let loadImage = this.moduleControl.find(r => r.ctrlName === "LoadImage")?.ctrlValue;
      // if (loadImage) {
      //   this.loadImage = loadImage === '1' ? true : false;
      // }
    }, error => {
      console.log(error);
    })
  }
  
  itemVariationXMasterList: MasterListDetails[] = [];
  itemVariationYMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.packingService.getMasterList().subscribe(response => {
      this.itemVariationXMasterList = response.filter(x => x.objectName == 'ItemVariationX').flatMap(src => src.details).filter(y => y.deactivated == 0);
      this.itemVariationYMasterList = response.filter(x => x.objectName == 'ItemVariationY').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  previousStep() {
    this.navController.navigateBack('/transactions/packing/packing-item');
  }

  async nextStep() {
    if (this.packingSalesOrderLines.length > 0) {
      const alert = await this.alertController.create({
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'OK',
            role: 'confirm',
            handler: async () => {
              await this.insertPacking();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error!', 'Please add at least 1 item to continue', 'bottom', 'danger', 1000);
    }
  }

  insertPacking() {
    let object: GoodsPackingRoot;
    let lines: GoodsPackingLine[] = [];
    this.packingSalesOrderLines.forEach(r => {
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
        soRowIndex: this.header.isWithSo ? (this.packingSalesOrders.flatMap(rr => rr.details).findIndex(rr => rr.salesOrderId === r.salesOrderId && rr.itemSku === r.itemSku)) : null,
        sequence: lines.length,
        locationId: this.header.locationId,
        cartonNum: 1
      })
    })
    let header: GoodsPackingHeader = {
      packingId: 0,
      packingNum: '',
      trxDate: this.header.trxDate,
      locationId: this.header.locationId,
      toLocationId: this.header.toLocationId,
      customerId: this.header.customerId,
      warehouseAgentId: this.header.warehouseAgentId,
      businessModelType: this.header.businessModelType,
      sourceType: 'M',
      isWithSo: this.header.isWithSo,
      remark: this.header.remark,
      typeCode: this.header.typeCode,
      totalCarton: 1
    }
    object = {
      header: header,
      details: lines
    }
    this.packingService.insertPacking(object).subscribe(response => {
      if (response.status === 201) {
        let ps: GoodsPackingSummary = {
          packingNum: response.body["header"]["packingNum"],
          customerId: response.body["header"]["customerId"],
          locationId: response.body["header"]["locationId"],
          trxDate: response.body["header"]["trxDate"]
        }

        this.packingService.setPackingSummary(ps);

        this.toastService.presentToast('Packing has been added', '', 'bottom', 'success', 1000);
        this.navController.navigateForward('/transactions/packing/packing-summary');
      }
    }, error => {
      console.log(error);
    })
  }

}
