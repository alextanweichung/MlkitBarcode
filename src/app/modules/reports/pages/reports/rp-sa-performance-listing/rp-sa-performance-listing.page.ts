import { Component, OnInit } from '@angular/core';
import { SAPerformanceListing } from '../../../models/rp-sa-performance-listing';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-rp-sa-performance-listing',
  templateUrl: './rp-sa-performance-listing.page.html',
  styleUrls: ['./rp-sa-performance-listing.page.scss'],
})
export class RpSaPerformanceListingPage implements OnInit {

  objects: SAPerformanceListing[] = [];
  
  columns: any;

  constructor(
    private reportService: ReportsService
  ) { }

  ngOnInit() {
    this.loadObjects();
    this.columns = [
      { prop: 'salesAgentCode', name: 'SA Code', draggable: false },
      { prop: 'salesAgentName', name: 'SA Name', draggable: false },
      { prop: 'transactionType', name: 'Trx Type', draggable: false },
      { prop: 'netAmount', name: 'Net Amount', draggable: false }
    ]
  }

  loadObjects() {
    try {
      this.reportService.getSAPerformance().subscribe(response => {
        this.objects = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

}
