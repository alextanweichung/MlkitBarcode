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

  showPurchaseOrderReview: boolean = false;
  showPurchaseOrderApproval: boolean = false;
  
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
          this.showPurchaseOrderReview = pageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderRV) > -1;
          this.showPurchaseOrderApproval = pageItems.findIndex(r => r.title === approvalAppCode.purchaseOrderAP) > -1;
          this.showOtpConfig = pageItems.findIndex(r => r.title === approvalAppCode.otpConfig) > -1;
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

}
