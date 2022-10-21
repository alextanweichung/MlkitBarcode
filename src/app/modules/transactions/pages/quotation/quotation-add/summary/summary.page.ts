import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { QuotationSummary } from 'src/app/modules/transactions/models/quotation';
import { QuotationService } from 'src/app/modules/transactions/services/quotation.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.page.html',
  styleUrls: ['./summary.page.scss'],
})
export class SummaryPage implements OnInit {

  quotationSummary: QuotationSummary;

  constructor(
    private quotationService: QuotationService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.quotationSummary = this.quotationService.quotationSummary;
    console.log("🚀 ~ file: summary.page.ts ~ line 22 ~ SummaryPage ~ ngOnInit ~ this.quotationSummary", this.quotationSummary)  
  }

  done() {
    this.quotationService.resetVariables();
    this.navController.navigateRoot('/quotation');
  }

}
