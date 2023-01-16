import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { DebtorOutStanding } from '../../models/debtor-outstanding';
import { ReportsService } from '../../services/reports.service';

const pageCode: string = 'MAOT';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {

  debtorOutstandings: DebtorOutStanding[] = [];

  constructor(
    private authService: AuthService,
    private reportService: ReportsService
  ) { }

  ngOnInit() {
    this.loadDebtorReport();
  }

  loadDebtorReport() {    
    this.reportService.getDebtorOutstanding().subscribe(response => {
      this.debtorOutstandings = response;
    }, error => {
      console.log(error);
    })
  }

}
