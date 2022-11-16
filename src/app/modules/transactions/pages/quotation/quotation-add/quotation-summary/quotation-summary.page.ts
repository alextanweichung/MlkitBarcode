import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QuotationSummary } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';

@Component({
  selector: 'app-quotation-summary',
  templateUrl: './quotation-summary.page.html',
  styleUrls: ['./quotation-summary.page.scss'],
})
export class QuotationSummaryPage implements OnInit {

  quotationSummary: QuotationSummary;

  constructor(
    private quotationService: QuotationService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.quotationSummary = this.quotationService.quotationSummary;
  }

  done() {
    this.quotationService.resetVariables();
    this.navController.navigateRoot('/transactions/quotation');
  }

}
