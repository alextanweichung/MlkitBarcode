import { Component, OnInit } from '@angular/core';
import { ViewDidEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { TransactionProcessingCount } from 'src/app/shared/models/transaction-processing';
import { PurchaseOrderService } from '../../../transactions/services/purchase-order.service';
import { QuotationService } from '../../../transactions/services/quotation.service';
import { SalesOrderService } from '../../../transactions/services/sales-order.service';

const managementPageCode: string = 'MAAP';
const quotationReviewCode: string = 'MAQURV';
const quotationApprovalCode: string = 'MAQUAP';
const salesOrderReviewCode: string = 'MASORV';
const salesOrderApprovalCode: string = 'MASOAP';
const purchaseOrderReviewCode: string = 'MAPORV';
const purchaseOrderApprovalCode: string = 'MAPOAP';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, ViewDidEnter {

  showQuotationReview: boolean = false;
  showQuotationApproval: boolean = false;

  showSalesOrderReview: boolean = false;
  showSalesOrderApproval: boolean = false;

  showPurchaseOrderReview: boolean = false;
  showPurchaseOrderApproval: boolean = false;
  
  last_sync_datetime: Date;

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private quotationService: QuotationService,
    private salesOrderService: SalesOrderService,
    private purchaseOrderService: PurchaseOrderService
  ) { }

  ionViewDidEnter(): void {
    this.last_sync_datetime = this.configService.sys_parameter.lastDownloadAt;
  }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === managementPageCode);
      if (pageItems) {
        this.showQuotationReview = pageItems.findIndex(r => r.title === quotationReviewCode) > -1;
        this.showQuotationApproval = pageItems.findIndex(r => r.title === quotationApprovalCode) > -1;
        this.showSalesOrderReview = pageItems.findIndex(r => r.title === salesOrderReviewCode) > -1;
        this.showSalesOrderApproval = pageItems.findIndex(r => r.title === salesOrderApprovalCode) > -1;
        this.showPurchaseOrderReview = pageItems.findIndex(r => r.title === purchaseOrderReviewCode) > -1;
        this.showPurchaseOrderApproval = pageItems.findIndex(r => r.title === purchaseOrderApprovalCode) > -1;
        this.loadPendingTask();
      }
    })
  }

  quotationReview: TransactionProcessingCount;
  quotationApproval: TransactionProcessingCount;
  salesOrderReview: TransactionProcessingCount;
  salesOrderApproval: TransactionProcessingCount;
  purchaseOrderReview: TransactionProcessingCount;
  purchaseOrderApproval: TransactionProcessingCount;
  loadPendingTask() {
    // if acl has quotation review
    if (this.showQuotationReview) {
      this.quotationService.getReviewDocumentCount().subscribe(response => {
        this.quotationReview = response;
      }, error => {
        console.log(error);
      })
    }
    // if acl has quotation approval
    if (this.showQuotationApproval) {
      this.quotationService.getApprovalDocumentCount().subscribe(response => {
        this.quotationApproval = response;
      }, error => {
        console.log(error);
      })
    }
    // if acl has sales order review
    if (this.showSalesOrderReview) {
      this.salesOrderService.getReviewDocumentCount().subscribe(response => {
        this.salesOrderReview = response;
      }, error => {
        console.log(error);
      })
    }
    // if acl has sales order approval
    if (this.showSalesOrderApproval) {
      this.salesOrderService.getApprovalDocumentCount().subscribe(response => {
        this.salesOrderApproval = response;
      }, error => {
        console.log(error);
      })
    }
    // if acl has purchase order review
    if (this.showPurchaseOrderReview) {
      this.purchaseOrderService.getReviewDocumentCount().subscribe(response => {
        this.purchaseOrderReview = response;
      }, error => {
        console.log(error);
      })
    }
    // if acl has purchase order approval
    if (this.showPurchaseOrderApproval) {
      this.purchaseOrderService.getApprovalDocumentCount().subscribe(response => {
        this.purchaseOrderApproval = response;
      }, error => {
        console.log(error);
      })
    }
  }


}
