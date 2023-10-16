import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoginUser } from 'src/app/services/auth/login-user';
import { moduleCode, reportAppCode } from 'src/app/shared/models/acl-const';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { ReportsService } from '../../services/reports.service';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  loginUser: LoginUser;
  isConsignmentUser: boolean = false;

  showDebtorLatestOutstanding: boolean = false;
  showSOListing: boolean = false;
  showSalesAgentPerformanceAll: boolean = false;
  showSalesByDebtor: boolean = false;
  showCheckQOH: boolean = false;
  showCheckCreditNote: boolean = false;
  showTransactionInquiry: boolean = false;
  showSalesAnalysis: boolean = false;

  constructor(
    private authService: AuthService,
    private objectService: ReportsService,
    private commonService: CommonService,
    private navController: NavController,
  ) { }

  ngOnInit() {
    try {
      this.authService.menuModel$.subscribe(obj => {
        let pageItems = obj?.flatMap(r => r.items).flatMap(r => r.items).filter(r => r.subModuleCode === moduleCode.report);
        if (pageItems) {
          this.showDebtorLatestOutstanding = pageItems.findIndex(r => r.title === reportAppCode.mobileDebtorLatestOutstanding) > -1;
          this.showSOListing = pageItems.findIndex(r => r.title === reportAppCode.mobileSOListing) > -1;
          this.showSalesAgentPerformanceAll = pageItems.findIndex(r => r.title === reportAppCode.mobileSAPerformance) > -1;
          this.showSalesByDebtor = pageItems.findIndex(r => r.title === reportAppCode.mobileSalesByDebtor) > -1;
          this.showCheckQOH = pageItems.findIndex(r => r.title === reportAppCode.mobileCheckQOH) > -1;
          this.showCheckCreditNote = pageItems.findIndex(r => r.title === reportAppCode.mobileCheckCN) > -1;
          this.showTransactionInquiry = pageItems.findIndex(r => r.title === reportAppCode.mobileTrxInq) > -1;
          this.showSalesAnalysis = pageItems.findIndex(r => r.title === reportAppCode.mobileSalesAnalysis) > -1;
        }
      })
    } catch (e) {
      console.error(e);
    }
    
    this.loginUser = JSON.parse(localStorage.getItem('loginUser'));
    this.isConsignmentUser = this.loginUser.loginUserType === "C";
  }

  goToReport(link: string) {
    this.navController.navigateRoot(`/reports/${link}`);
  }

  async downloadCustomerDetails() {
    if (this.isConsignmentUser && this.loginUser.salesAgentId) {
      let paramModel: ReportParameterModel = {
        appCode: "SMMD001",
        format: "pdf",
        documentIds: [this.loginUser.salesAgentId],
        reportName: "Customer Listing By Latest Sales Agent",
      }
      let timestart = new Date();
      await this.objectService.getPdf(paramModel).subscribe(async response => {
        let timeend = new Date();
        await this.commonService.commonDownloadPdf(response, "MyCustomerDetail." + paramModel.format);
      }, error => {
        console.log(error);
      })
    }
  }

}
