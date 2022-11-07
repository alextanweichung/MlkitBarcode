import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { GoodsPacking, GoodspackingDto, GoodsPackingLine, PackingSummary } from 'src/app/modules/transactions/models/packing';
import { PackingSalesOrderDetail, PackingSalesOrderRoot } from 'src/app/modules/transactions/models/packing-sales-order';
import { PackingService } from 'src/app/modules/transactions/services/packing.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-packing-confirmation',
  templateUrl: './packing-confirmation.page.html',
  styleUrls: ['./packing-confirmation.page.scss'],
})
export class PackingConfirmationPage implements OnInit {

  packingDtoHeader: GoodsPacking;
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
    this.packingDtoHeader = this.packingService.packingDtoHeader;
    if (this.packingDtoHeader === undefined) {
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/transactions/packing/packing-sales-order');
    }
    this.packingSalesOrders = this.packingService.selectedSalesOrders;
    this.packingSalesOrderLines = this.packingService.selectedSalesOrderLines;
    this.loadModuleControl();  
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

  previousStep() {
    this.navController.navigateBack('/transactions/packing/packing-item');
  }

  nextStep() {
    let object: GoodspackingDto;
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
        soRowIndex: this.packingDtoHeader.isWithSo ? (this.packingSalesOrders.flatMap(rr => rr.details).findIndex(rr => rr.salesOrderId === r.salesOrderId && rr.itemSku === r.itemSku)) : null,
        sequence: lines.length,
        locationId: this.packingDtoHeader.locationId,
        cartonNum: 1
      })
    })
    let header: GoodsPacking = {
      packingId: 0,
      packingNum: '',
      trxDate: this.packingDtoHeader.trxDate,
      locationId: this.packingDtoHeader.locationId,
      toLocationId: this.packingDtoHeader.toLocationId,
      customerId: this.packingDtoHeader.customerId,
      warehouseAgentId: this.packingDtoHeader.warehouseAgentId,
      businessModelType: this.packingDtoHeader.businessModelType,
      sourceType: 'M',
      isWithSo: this.packingDtoHeader.isWithSo,
      remark: this.packingDtoHeader.remark,
      typeCode: this.packingDtoHeader.typeCode,
      totalCarton: 1
    }
    object = {
      header: header,
      details: lines
    }
    this.packingService.insertPacking(object).subscribe(response => {
      if (response.status === 201) {
        let ps: PackingSummary = {
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
