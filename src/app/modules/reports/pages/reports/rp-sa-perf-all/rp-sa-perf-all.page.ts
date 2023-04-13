import { Component, OnInit } from '@angular/core';
import { SalesAgentAllPerformanceObject } from '../../../models/rp-sa-performance-listing';
import { ReportsService } from '../../../services/reports.service';
import { ViewWillEnter } from '@ionic/angular';
import { CommonService } from '../../../../../shared/services/common.service';
import { ToastService } from '../../../../../services/toast/toast.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-rp-sa-perf-all',
  templateUrl: './rp-sa-perf-all.page.html',
  styleUrls: ['./rp-sa-perf-all.page.scss'],
})
export class RpSaPerfAllPage implements OnInit, ViewWillEnter {

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
            r.netAmount = r.invoiceAmt + r.cnAmount;
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

}
