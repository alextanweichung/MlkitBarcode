import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { CommonService } from 'src/app/shared/services/common.service';
import { ConsignmentSalesList } from '../../models/consignment-sales';
import { GoodsPackingList } from '../../models/packing';
import { GoodsPickingList } from '../../models/picking';
import { QuotationList } from '../../models/quotation';
import { SalesOrderList } from '../../models/sales-order';
import { ConsignmentSalesService } from '../../services/consignment-sales.service';
import { PackingService } from '../../services/packing.service';
import { PickingService } from '../../services/picking.service';
import { QuotationService } from '../../services/quotation.service';
import { SalesOrderService } from '../../services/sales-order.service';

const pageCode: string = 'MATR';
const mobileQuotationCode: string = 'MATRQU';
const mobileSalesOrderCode: string = 'MATRSO';
const mobilePickingCode: string = 'MATRPI';
const mobilePackingCode: string = 'MATRPA';
const mobileConsignmentSalesCode: string = 'MATRCS';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {

  showQuotation: boolean = false;
  quotations: QuotationList[] = [];

  showSalesOrder: boolean = false;
  salesOrders: SalesOrderList[] = [];

  showPicking: boolean = false;
  pickings: GoodsPickingList[] = [];

  showPacking: boolean = false;
  packings: GoodsPackingList[] = [];

  showConsignmentSales: boolean = false;
  consignment_sales: ConsignmentSalesList[] = [];

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private quotationService: QuotationService,
    private salesOrderService: SalesOrderService,
    private pickingService: PickingService,
    private packingService: PackingService,
    private consignmentSalesService: ConsignmentSalesService,
    private loadingController: LoadingController,
    private commonService: CommonService,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === pageCode);
      if (pageItems) {
        this.showQuotation = pageItems.findIndex(r => r.title === mobileQuotationCode) > -1;
        this.showSalesOrder = pageItems.findIndex(r => r.title === mobileSalesOrderCode) > -1;
        this.showPicking = pageItems.findIndex(r => r.title === mobilePickingCode) > -1;
        this.showPacking = pageItems.findIndex(r => r.title === mobilePackingCode) > -1;
        this.showConsignmentSales = pageItems.findIndex(r => r.title === mobileConsignmentSalesCode) > -1;
      }
    })
    this.loadAllRecentList();
  }

  handleRefresh(event) {
    setTimeout(() => {
      this.loadAllRecentList();
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  };

  loadAllRecentList() {
    // quotation
    if (this.showQuotation) {
      this.loadRecentQuotation();
    }

    // sales order
    if (this.showSalesOrder) {
      this.loadRecentSalesOrder();
    }

    // picking
    if (this.showPicking) {
      this.loadRecentPicking();
    }

    // packing
    if (this.showPacking) {
      this.loadRecentPacking();
    }

    // consignment-sales
    if (this.showConsignmentSales) {
      this.loadRecentConsignmentSales();
    }
  }

  /* #region  online offline */

  // transactionMode: string = "online";
  // onTransactionModeChanged(event) {
  //    if (event.detail.value === 'offline') {
  //     this.sync();
  //    }
  // }

  async sync() {
    // Loading overlay
    if (Capacitor.getPlatform() !== 'web') {
      const loading = await this.loadingController.create({
        cssClass: 'default-loading',
        message: '<p>Syncing Offline Table...</p><span>Please be patient.</span>',
        spinner: 'crescent'
      });
      await loading.present();

      this.commonService.syncInbound().subscribe(async response => {
        let itemMaster: PDItemMaster[] = response['itemMaster'];
        let itemBarcode: PDItemBarcode[] = response['itemBarcode'];
        await this.configService.syncInboundData(itemMaster, itemBarcode);
        loading.dismiss();
      }, error => {
        console.log(error);
      })
    }
  }

  /* #endregion */

  /* #region  quotation */

  loadRecentQuotation() {
    this.quotationService.getObjectList().subscribe(response => {
      this.quotations = response.slice(0, 3);
    }, error => {
      console.log(error);
    })
  }

  async goToQuotationDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/quotation/quotation-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  sales order */

  loadRecentSalesOrder() {
    this.salesOrderService.getObjectList().subscribe(response => {
      this.salesOrders = response.slice(0, 3);
    }, error => {
      console.log(error);
    })
  }

  async goToSalesOrderDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId,
      }
    }
    this.navController.navigateForward('/transactions/sales-order/sales-order-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  picking */

  loadRecentPicking() {
    this.pickingService.getObjectList().subscribe(response => {
      this.pickings = response.slice(0, 3);
    }, error => {
      console.log(error);
    })
  }

  async goToPickingDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId,
      }
    }
    this.navController.navigateForward('/transactions/picking/picking-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  packing */

  loadRecentPacking() {
    this.packingService.getObjectList().subscribe(response => {
      this.packings = response.slice(0, 3);
    }, error => {
      console.log(error);
    })
  }

  async goToPackingDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId,
      }
    }
    this.navController.navigateForward('/transactions/packing/packing-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  other-sales */

  loadRecentConsignmentSales() {
    this.consignmentSalesService.getObjectList().subscribe(response => {
      this.consignment_sales = response.slice(0, 3);
    }, error => {
      console.log(error);
    })
  }

  goToConsignmentSalesDetail(objectId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: objectId
      }
    }
    this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-detail', navigationExtras);
  }

  /* #endregion */

}
