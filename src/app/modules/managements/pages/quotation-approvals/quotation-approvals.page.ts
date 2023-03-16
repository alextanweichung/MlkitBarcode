import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionProcessingDoc } from 'src/app/shared/models/transaction-processing';
import { TransactionProcessingService } from 'src/app/shared/services/transaction-processing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quotation-pending-approval',
  templateUrl: './quotation-approvals.page.html',
  styleUrls: ['./quotation-approvals.page.scss'],
  providers: [TransactionProcessingService, { provide: 'apiObject', useValue: 'mobileQuotationApprove' }]
})
export class QuotationApprovalsPage implements OnInit, ViewWillEnter {

  pendingObjects: TransactionProcessingDoc[] = [];
  completedObjects: TransactionProcessingDoc[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private commonService: CommonService,
    private transactionProcessingService: TransactionProcessingService,
    private toastService: ToastService,
    private modalController: ModalController
  ) { }

  // make sure refresh when back to this page
  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTheYear();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  ngOnInit() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTheYear();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  loadObjects() {
    try {
      this.transactionProcessingService.getProcessingDocumentByDateRange(format(parseISO(this.startDate.toISOString()), 'yyyy-MM-dd'), format(parseISO(this.endDate.toISOString()), 'yyyy-MM-dd')).subscribe(response => {
        this.pendingObjects = response.filter(r => !r.isComplete);
        this.completedObjects = response.filter(r => r.isComplete);
        this.toastService.presentToast('Search Complete', '', 'top', 'success', 1000);
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Error loading objects', '', 'top', 'danger', 1000);
    }
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
