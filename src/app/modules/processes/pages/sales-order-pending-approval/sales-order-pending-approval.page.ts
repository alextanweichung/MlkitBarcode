import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { CommonService } from 'src/app/modules/transactions/services/common.service';
import { TransactionProcessingDoc } from 'src/app/shared/models/transaction-processing';
import { TransactionProcessingService } from 'src/app/shared/services/transaction-processing.service';

@Component({
  selector: 'app-sales-order-pending',
  templateUrl: './sales-order-pending-approval.page.html',
  styleUrls: ['./sales-order-pending-approval.page.scss'],
  providers: [TransactionProcessingService, { provide: 'apiObject', useValue: 'mobileSalesOrderApprove' }]
})
export class SalesOrderPendingApproval implements OnInit {

  objects: TransactionProcessingDoc[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private navController: NavController,
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
      this.objects = response;
      this.objects = this.objects.filter(r => !r.isComplete);
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