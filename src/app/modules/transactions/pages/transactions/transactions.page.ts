import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoadingController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { PDItemBarcode, PDItemMaster } from 'src/app/shared/models/pos-download';
import { CommonService } from 'src/app/shared/services/common.service';
import { OtherSalesList } from '../../models/other-sales';
import { PackingList } from '../../models/packing';
import { PickingList } from '../../models/picking';
import { QuotationList } from '../../models/quotation';
import { SalesOrderList } from '../../models/sales-order';
import { OtherSalesService } from '../../services/other-sales.service';
import { PackingService } from '../../services/packing.service';
import { PickingService } from '../../services/picking.service';
import { QuotationService } from '../../services/quotation.service';
import { SalesOrderService } from '../../services/sales-order.service';

const pageCode: string = 'MATR';
const mobileQuotationCode: string = 'MATRQU';
const mobileSalesOrderCode: string = 'MATRSO';
const mobilePickingCode: string = 'MATRPI';
const mobilePackingCode: string = 'MATRPA';
const mobileOtherSalesCode: string = 'MATROS';

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
  pickings: PickingList[] = [];

  showPacking: boolean = false;
  packings: PackingList[] = [];

  showOtherSales: boolean = false;
  other_sales: OtherSalesList[] = [];

  constructor(
    private authService: AuthService,
    private navController: NavController,
    private quotationService: QuotationService,
    private salesOrderService: SalesOrderService,
    private pickingService: PickingService,
    private packingService: PackingService,
    private otherSalesService: OtherSalesService,
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
        this.showOtherSales = pageItems.findIndex(r => r.title === mobileOtherSalesCode) > -1;
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
    this.loadRecentQuotation();

    // sales order
    this.loadRecentSalesOrder();

    // picking
    this.loadRecentPicking();

    // packing
    this.loadRecentPacking();

    // other-sales
    // this.loadRecentOtherSales();
  }

  /* #region  online offline */

  transactionMode: string = "online";
  onTransactionModeChanged(event) {
     if (event.detail.value === 'offline') {
      this.sync();
     }
  }

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

      // Fake timeout
      // setTimeout(() => {
      //   loading.dismiss();
      // }, 2000);
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

  /* #region  quotation */

  loadRecentSalesOrder() {
    this.salesOrderService.getRecentSalesOrderList().subscribe(response => {
      this.salesOrders = response;
    }, error => {
      console.log(error);
    })
  }

  async goToSalesOrderDetail(salesOrderId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        salesOrderId: salesOrderId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/transactions/sales-order/sales-order-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  picking */

  loadRecentPicking() {
    this.pickingService.getRecentPickingList().subscribe(response => {
      this.pickings = response;
    }, error => {
      console.log(error);
    })
  }

  async goToPickingDetail(pickingId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        pickingId: pickingId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/transactions/picking/picking-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  packing */

  loadRecentPacking() {
    this.packingService.getRecentPackingList().subscribe(response => {
      this.packings = response;
    }, error => {
      console.log(error);
    })
  }

  async goToPackingDetail(packingId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        packingId: packingId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/transactions/packing/packing-detail', navigationExtras);
  }

  /* #endregion */

  /* #region  other-sales */

  loadRecentOtherSales() {
    this.otherSalesService.getRecentOtherSalesList().subscribe(response => {
      this.other_sales = response;
    }, error => {
      console.log(error);
    })
  }

  goToOtherSalesDetail(otherSalesId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        otherSalesId: otherSalesId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/transactions/other-sales/other-sales-detail', navigationExtras);
  }

  /* #endregion */

}
