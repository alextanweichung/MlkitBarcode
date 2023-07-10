import { Component, OnInit } from '@angular/core';
import { SalesAgentAllPerformanceObject } from '../../../models/rp-sa-performance-listing';
import { ReportsService } from '../../../services/reports.service';
import { ViewWillEnter } from '@ionic/angular';
import { CommonService } from '../../../../../shared/services/common.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-rp-sales-performance',
  templateUrl: './rp-sales-performance.page.html',
  styleUrls: ['./rp-sales-performance.page.scss'],
})
export class RpSalesPerformancePage implements OnInit, ViewWillEnter {

  objects: SalesAgentAllPerformanceObject[] = [];

  startDate: Date = null;
  endDate: Date = null;

  columns: any;

  constructor(
    private reportService: ReportsService,
    private commonService: CommonService,
    private toastService: ToastService
  ) { }

  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
  }

  ngOnInit() {
    this.columns = [
      { prop: 'salesAgentName', name: 'SA Name', draggable: false },
      { prop: 'invoiceAmt', name: 'Invoice', draggable: false },
      { prop: 'cnAmount', name: 'Credit Note', draggable: false },
      { prop: 'soAmount', name: 'SO Amount', draggable: false },
      { prop: 'netAmount', name: 'Net Amount', draggable: false }
    ]
  }

  loadReport() {
    if (!this.startDate || !this.endDate) {
      this.toastService.presentToast('Error', 'Invalid Date', 'top', 'warning', 1000);
    } else {
      try {
        this.reportService.getAllSalesPerformance(format(this.startDate, 'yyyy-MM-dd'), format(this.endDate, 'yyyy-MM-dd')).subscribe(response => {
          this.objects = response;
          this.objects.forEach(r => {
            r.netAmount = r.invoiceAmt - r.cnAmount + r.soAmount;
          })
        }, error => {
          throw error;
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  onStartDateSelected(event) {
    if (event) {
      this.startDate = event;
    }
  }

  onEndDateSelected(event) {
    if (event) {
      this.endDate = event;
    }
  }

  calculateSummaryValue(columnProp: string): number {
    console.log("🚀 ~ file: rp-sales-performance.page.ts:80 ~ RpSalesPerformancePage ~ calculateSummaryValue ~ columnProp:", columnProp)
    let summaryValue = 0;
    if (columnProp !== 'salesAgentName') {
      // Calculate summary value for 'age' column
      const ages = this.objects.map((item) => item[columnProp]);
      summaryValue = ages.reduce((acc, age) => acc + age, 0);
    }
    // Add more conditions for other columns if needed
    return summaryValue;
  }

  // customSummaryFunc = (cells: any[]) => {
  //   console.log("🚀 ~ file: rp-sales-performance.page.ts:80 ~ RpSalesPerformancePage ~ cells:", cells)
  //   // Custom summary calculation logic
  //   const sum = cells.reduce((total, cell) => total + cell, 0);
  //   return `Total: ${sum}`;
  // };

}
