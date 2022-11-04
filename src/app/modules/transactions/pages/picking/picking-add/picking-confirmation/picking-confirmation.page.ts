import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { GoodsPicking, GoodsPickingDto, GoodsPickingLine, PickingSummary } from 'src/app/modules/transactions/models/picking';
import { PickingSalesOrderDetail, PickingSalesOrderRoot } from 'src/app/modules/transactions/models/picking-sales-order';
import { PickingService } from 'src/app/modules/transactions/services/picking.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ModuleControl } from 'src/app/shared/models/module-control';

@Component({
  selector: 'app-picking-confirmation',
  templateUrl: './picking-confirmation.page.html',
  styleUrls: ['./picking-confirmation.page.scss'],
})
export class PickingConfirmationPage implements OnInit {

  pickingDtoHeader: GoodsPicking;
  pickingSalesOrders: PickingSalesOrderRoot[] = [];
  pickingSalesOrderLines: PickingSalesOrderDetail[] = [];
  moduleControl: ModuleControl[] = [];
  loadImage: boolean = true;
  
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private pickingService: PickingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.pickingDtoHeader = this.pickingService.pickingDtoHeader;
    if (this.pickingDtoHeader === undefined) {
      this.toastService.presentToast('Something went wrong!', '', 'bottom', 'danger', 1000);
      this.navController.navigateBack('/transactions/picking/picking-sales-order');
    }
    this.pickingSalesOrders = this.pickingService.selectedSalesOrders;
    this.pickingSalesOrderLines = this.pickingService.selectedSalesOrderLines;
    console.log("🚀 ~ file: picking-confirmation.page.ts ~ line 39 ~ PickingConfirmationPage ~ ngOnInit ~ this.pickingSalesOrderLines", this.pickingSalesOrderLines)
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
    this.navController.navigateBack('/transactions/picking/picking-item');
  }

  nextStep() {
    let object: GoodsPickingDto;
    let lines: GoodsPickingLine[] = [];
    this.pickingSalesOrderLines.forEach(r => {
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
        soRowIndex: this.pickingDtoHeader.isWithSo ? (this.pickingSalesOrders.flatMap(rr => rr.details).findIndex(rr => rr.salesOrderId === r.salesOrderId && rr.itemSku === r.itemSku)) : null,
        sequence: lines.length,
        locationId: this.pickingDtoHeader.locationId
      })
    })
    let header: GoodsPicking = {
      pickingId: 0,
      pickingNum: '',
      trxDate: this.pickingDtoHeader.trxDate,
      locationId: this.pickingDtoHeader.locationId,
      toLocationId: this.pickingDtoHeader.toLocationId,
      customerId: this.pickingDtoHeader.customerId,
      warehouseAgentId: this.pickingDtoHeader.warehouseAgentId,
      businessModelType: this.pickingDtoHeader.businessModelType,
      sourceType: 'M',
      isWithSo: this.pickingDtoHeader.isWithSo,
      remark: this.pickingDtoHeader.remark,
      typeCode: this.pickingDtoHeader.typeCode
    }
    object = {
      header: header,
      details: lines
    }
    console.log("🚀 ~ file: picking-confirmation.page.ts ~ line 93 ~ PickingConfirmationPage ~ nextStep ~ object", object)
    this.pickingService.insertPicking(object).subscribe(response => {
      if (response.status === 201) {
        let ps: PickingSummary = {
          pickingNum: response.body["header"]["pickingNum"],
          customerId: response.body["header"]["customerId"],
          locationId: response.body["header"]["locationId"],
          trxDate: response.body["header"]["trxDate"]
        }
        
        this.pickingService.setPickingSummary(ps);

        this.toastService.presentToast('Picking has been added', '', 'bottom', 'success', 1000);
        this.navController.navigateForward('/transactions/picking/picking-summary');
      }
    }, error => {
      console.log(error);
    })

  }

}
