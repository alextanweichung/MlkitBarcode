import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ConsignmentSalesRoot } from 'src/app/modules/transactions/models/consignment-sales';
import { ConsignmentSalesService } from 'src/app/modules/transactions/services/consignment-sales.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { PrecisionList } from 'src/app/shared/models/precision-list';

@Component({
  selector: 'app-consignment-sales-summary',
  templateUrl: './consignment-sales-summary.page.html',
  styleUrls: ['./consignment-sales-summary.page.scss'],
})
export class ConsignmentSalesSummaryPage implements OnInit {

  object: ConsignmentSalesRoot;

  constructor(
    private authService: AuthService,
    public objectService: ConsignmentSalesService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.object = this.objectService.object;
    this.loadModuleControl();
  }

  precisionSales: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  precisionTax: PrecisionList = { precisionId: null, precisionCode: null, description: null, localMin: null, localMax: null, foreignMin: null, foreignMax: null, localFormat: null, foreignFormat: null };
  maxPrecision: number = 2;
  maxPrecisionTax: number = 2;
  loadModuleControl() {
    try {
      this.authService.precisionList$.subscribe(precision => {
        this.precisionSales = precision.find(x => x.precisionCode == "SALES");
        this.precisionTax = precision.find(x => x.precisionCode == "TAX");
        this.maxPrecision = this.precisionSales.localMax;
        this.maxPrecisionTax = this.precisionTax.localMax;
      })
    } catch (e) {
      console.error(e);
    }
  }

  done() {
    this.objectService.resetVariables();
    this.navController.navigateRoot('/transactions/consignment-sales');
  }

}
