import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { ConsignmentSalesRoot } from '../../../models/consignment-sales';
import { ConsignmentSalesService } from '../../../services/consignment-sales.service';

@Component({
  selector: 'app-consignment-sales-detail',
  templateUrl: './consignment-sales-detail.page.html',
  styleUrls: ['./consignment-sales-detail.page.scss'],
})
export class ConsignmentSalesDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: ConsignmentSalesRoot;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    public objectService: ConsignmentSalesService,
    private navController: NavController
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
  }

  ionViewWillEnter(): void {
    if (this.objectId) {
      this.loadObject();
    }
  }

  ngOnInit() {
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

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
    }
  }

  edit() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        objectId: this.objectId
      }
    }
    this.navController.navigateForward('/transactions/consignment-sales/consignment-sales-item-edit', navigationExtras);
  }

}
