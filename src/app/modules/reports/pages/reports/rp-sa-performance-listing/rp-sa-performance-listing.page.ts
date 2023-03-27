import { Component, OnInit } from '@angular/core';
import { SAPerformaceListing } from '../../../models/rp-sa-performace-listing';
import { ReportsService } from '../../../services/reports.service';

@Component({
  selector: 'app-rp-sa-performance-listing',
  templateUrl: './rp-sa-performance-listing.page.html',
  styleUrls: ['./rp-sa-performance-listing.page.scss'],
})
export class RpSaPerformanceListingPage implements OnInit {

  objects: SAPerformaceListing[] = [];

  constructor(
    private reportService: ReportsService
  ) { }

  ngOnInit() {
    this.loadObjects();
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
