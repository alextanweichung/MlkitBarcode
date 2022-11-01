import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionProcessingDoc } from 'src/app/shared/models/transaction-processing';
import { TransactionProcessingService } from 'src/app/shared/services/transaction-processing.service';

@Component({
  selector: 'app-sales-order-pending-review',
  templateUrl: './sales-order-reviews.page.html',
  styleUrls: ['./sales-order-reviews.page.scss'],
  providers: [TransactionProcessingService, { provide: 'apiObject', useValue: 'mobileSalesOrderReview' }]
})
export class SalesOrderReviewsPage implements OnInit {

  pendingObjects: TransactionProcessingDoc[] = [];
  completedObjects: TransactionProcessingDoc[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private transactionProcessingService: TransactionProcessingService,
    private modalController: ModalController,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  loadObjects() {
    this.transactionProcessingService.getProcessingDocumentByDateRange(format(parseISO(this.startDate.toISOString()), 'yyyy-MM-dd'), format(parseISO(this.endDate.toISOString()), 'yyyy-MM-dd')).subscribe(response => {
      this.pendingObjects = response.filter(r => !r.isComplete);
      this.completedObjects = response.filter(r => r.isComplete);
    }, error => {
      console.log(error);
    })
  }

  onObjectUpdated(event) {
    this.loadObjects();
  }

  async filter() {
    const modal = await this.modalController.create({
      component: FilterPage,
      componentProps: {
        startDate: this.startDate,
        endDate: this.endDate
      },
      canDismiss: true
    })

    await modal.present();

    let { data } = await modal.onWillDismiss();

    if (data && data !== undefined) {
      this.startDate = new Date(data.startDate);
      this.endDate = new Date(data.endDate);

      this.loadObjects();
    }
  }

}
