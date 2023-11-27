import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { approvalAppCode, moduleCode } from 'src/app/shared/models/acl-const';

// const managementPageCode: string = 'MAAP';
// const quotationReviewCode: string = 'MAQURV';
// const quotationApprovalCode: string = 'MAQUAP';
// const salesOrderReviewCode: string = 'MASORV';
// const salesOrderApprovalCode: string = 'MASOAP';
// const purchaseOrderReviewCode: string = 'MAPORV';
// const purchaseOrderApprovalCode: string = 'MAPOAP';
// const otpConfigCode: string = 'MAMAOTP';

@Component({
  selector: 'app-management',
  templateUrl: './management.page.html',
  styleUrls: ['./management.page.scss'],
})
export class ManagementPage implements OnInit {

  showQuotationReview: boolean = false;
  showQuotationApproval: boolean = false;
  showSalesOrderReview: boolean = false;
  showSalesOrderApproval: boolean = false;
  showBackToBackOrderReview: boolean = false;
  showBackToBackOrderApproval: boolean = false;
  showPurchaseReqReview: boolean = false;
  showPurchaseReqApproval: boolean = false;
  showPurchaseOrderReview: boolean = false;
  showPurchaseOrderApproval: boolean = false;
  showNonTradePurchaseReqReview: boolean = false;
  showNonTradePurchaseReqApproval: boolean = false;
  showNonTradePurchaseOrderReview: boolean = false;
  showNonTradePurchaseOrderApproval: boolean = false;
  showSalesOrderPricingApproval: boolean = false;
  showBackToBackOrderPricingApproval: boolean = false;
  showRefundApproval: boolean = false;
  showExchangeApproval: boolean = false;
  showRecallDepositApproval: boolean = false;
  showBranchReceivingApproval: boolean = false;
  showBranchReceivingReview: boolean = false;
  showOtpConfig: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    try {
      this.authService.menuModel$.subscribe(obj => {
        let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.approval);
        if (pageItems) {
          this.showQuotationReview = pageItems.findIndex(r => r.title === approvalAppCode.quotationRV) > -1;
          this.showQuotationApproval = pageItems.findIndex(r => r.title === approvalAppCode.quotationAP) > -1;
          this.showSalesOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.salesOrderRV) > -1;
          this.showSalesOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.salesOrderAP) > -1;
          this.showBackToBackOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.b2bOrderRV) > -1;
          this.showBackToBackOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.b2bOrderAP) > -1;
          this.showPurchaseReqReview = pageItems.findIndex(r => r.title === approvalAppCode.purchaseReqRV) > -1;
          this.showPurchaseReqApproval = pageItems.findIndex(r => r.title === approvalAppCode.purchaseReqAP) > -1;
          this.showPurchaseOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderRV) > -1;
          this.showPurchaseOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderAP) > -1;

          this.showNonTradePurchaseReqReview = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePRRV) > -1;
          this.showNonTradePurchaseReqApproval = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePRAP) > -1;

          this.showNonTradePurchaseOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePORV) > -1;
          this.showNonTradePurchaseOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.nonTradePOAP) > -1;
          this.showSalesOrderPricingApproval = pageItems.findIndex(r => r.title === approvalAppCode.salesOrderPricingAP) > -1;
          this.showBackToBackOrderPricingApproval = pageItems.findIndex(r => r.title === approvalAppCode.b2bOrderPricingAP) > -1;
          this.showBranchReceivingApproval = pageItems.findIndex(r => r.title === approvalAppCode.branchReceivingAP) > -1;
          this.showBranchReceivingReview = pageItems.findIndex(r => r.title === approvalAppCode.branchReceivingRV) > -1;

          this.showRefundApproval = pageItems.findIndex(r => r.title === approvalAppCode.refundAP) > -1;
          this.showExchangeApproval = pageItems.findIndex(r => r.title === approvalAppCode.exchangeAP) > -1;
          this.showRecallDepositApproval = pageItems.findIndex(r => r.title === approvalAppCode.recallDepositAP) > -1;
          
          this.showOtpConfig = pageItems.findIndex(r => r.title === approvalAppCode.otpConfig) > -1;
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

}
