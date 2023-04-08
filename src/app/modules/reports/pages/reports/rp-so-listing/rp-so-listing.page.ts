import { Component, OnInit } from '@angular/core';
import { ReportParameterModel } from 'src/app/shared/models/report-param-model';
import { CommonService } from 'src/app/shared/services/common.service';
import { ReportSOListing } from '../../../models/rp-so-listing';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-rp-so-listing',
  templateUrl: './rp-so-listing.page.html',
  styleUrls: ['./rp-so-listing.page.scss'],
})
export class RpSoListingPage implements OnInit {

  objects: ReportSOListing[] = [];

  data: any;
  columns: any;

  constructor(
    private reportService: ReportsService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.loadObjects();
    this.columns = [
      { prop: 'issuedDate', name: 'Issued Date', draggable: false },
      { prop: 'debtorCode', name: 'Debtor Code', draggable: false },
      { prop: 'debtorName', name: 'Debtor Name', draggable: false },
      { prop: 'salesmanName', name: 'Salesman', draggable: false },
      // { prop: 'onlineOrder', name: 'Online Order', draggable: false },
      { prop: 'orderStatus', name: 'Order Status', draggable: false },
      { prop: 'salesOrderNum', name: 'Sales Order', draggable: false },
      { prop: 'deliveryOrderIds', name: 'Delivery Order', draggable: false },
      { prop: 'delivered', name: 'Delivered', draggable: false },
      { prop: 'netAmount', name: 'Net Amount', draggable: false }
    ]
  }

  loadObjects() {
    try {
      this.reportService.getSOListing().subscribe(response => {
        this.objects = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  async downloadPdf(objectId: number) {
    try {
      let paramModel: ReportParameterModel = {
        appCode: 'SMSC002',
        format: 'pdf',
        documentIds: [objectId],
        reportName: 'Sales Order'
      }
      this.reportService.getPdf(paramModel).subscribe(async response => {
        await this.commonService.commonDownloadPdf(response, paramModel.reportName + "." + paramModel.format);
      }, error => {
        throw error;
      })      
    } catch (e) {
      console.error(e);
    }
  }

  doDialog: boolean = false;
  deliveryOrderObject: string[] = [];
  async showDialogOrDownload(deliveryOrders: string) {
    this.deliveryOrderObject = []
    try {
      this.deliveryOrderObject = deliveryOrders.split(';');
      if (this.deliveryOrderObject && this.deliveryOrderObject.length === 1) {
        await this.downloadDOPdf(Number(this.deliveryOrderObject[0].split('|')[1]));
      } else {
        this.showDoDialog();
      }
    } catch (e) {
      console.error(e);
    }
  }

  showDoDialog() {
    this.doDialog = true;
  }

  hideDoDialog() {
    this.doDialog = false;
  }

  downloadDOPdf(objectId: number|string) {
    let paramModel: ReportParameterModel = {
      appCode: 'WDOP001',
      format: 'pdf',
      documentIds: [Number(objectId)],
      reportName: 'Delivery Order'
    }
    this.reportService.getPdf(paramModel).subscribe(async response => {
      await this.commonService.commonDownloadPdf(response, paramModel.reportName + "." + paramModel.format);
    }, error => {
      throw error;
    })
  }

}
