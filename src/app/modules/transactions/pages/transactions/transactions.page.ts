import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { IonRouterOutlet, ModalController, NavController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { QuotationList } from '../../models/quotation';
import { QuotationService } from '../../services/quotation.service';
import { TransactionsService } from '../../services/transactions.service';
import { FilterPage } from '../filter/filter.page';
import { DetailPage } from '../quotation/quotation-detail/detail/detail.page';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {

  quotation_loaded: boolean = false;
  quotations: QuotationList[] = [];

  sales_order_loaded: boolean = false;

  constructor(
    private routerOutlet: IonRouterOutlet,
    private modalController: ModalController,
    private navController: NavController,
    private quotationService: QuotationService
  ) { }

  ngOnInit() {
    this.loadAllRecentList();
  }

  loadAllRecentList() {
    // quotation
    this.quotationService.getQuotationList().subscribe(response => {
      this.quotations = response;
      if (this.quotations.length > 0) {
        this.quotations = this.quotations.slice(0, 3); // only take latest 3
        this.quotation_loaded = true;
      }
    }, error => {
      console.log(error);
    })

    // sales order
    // this.quotation_loaded = true;
    // this.objectService.getSalesOrderRecentList().subscribe(response => {
    //   console.log("🚀 ~ file: transactions.page.ts ~ line 30 ~ TransactionsPage ~ this.objectService.getSalesOrderRecentList ~ response", JSON.stringify(response))
    //   // this.sales_order_loaded = true;
    // }, error => {
    //   console.log(error);
    // })
  }

  async filter() {
    const modal = await this.modalController.create({
      component: FilterPage,
      canDismiss: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();

    let { data } = await modal.onWillDismiss();

    if (data) {
      // this.objectService.getSalesOrderList().subscribe(response => {
      //   this.sales_order_loaded = true;
      // }, error => {
      //   console.log(error);
      // })
    }
  }


  /* #region  quotation */

  async goToQuotationDetail(quotationId: number) {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        quotationId: quotationId,
        parent: "Transactions"
      }
    }
    this.navController.navigateForward('/quotation/detail', navigationExtras);
  }

  /* #endregion */

}
