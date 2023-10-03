import { Component, OnInit } from '@angular/core';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { FilterPage } from 'src/app/modules/transactions/pages/filter/filter.page';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransactionProcessingDoc } from 'src/app/shared/models/transaction-processing';
import { TransactionProcessingService } from 'src/app/shared/services/transaction-processing.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-sales-order-pending-review',
  templateUrl: './sales-order-reviews.page.html',
  styleUrls: ['./sales-order-reviews.page.scss'],
  providers: [TransactionProcessingService, { provide: "apiObject", useValue: "mobileSalesOrderReview" }]
})
export class SalesOrderReviewsPage implements OnInit, ViewWillEnter {

  pendingObjects: TransactionProcessingDoc[] = [];
  completedObjects: TransactionProcessingDoc[] = [];

  startDate: Date;
  endDate: Date;

  constructor(
    private authService: AuthService,
    private objectService: TransactionProcessingService,
    private toastService: ToastService,
    private modalController: ModalController,
    private commonService: CommonService
  ) { }

  // make sure refresh when back to this page
  ionViewWillEnter(): void {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
    if (!this.endDate) {
      this.endDate = this.commonService.getTodayDate();
    }
    this.loadObjects();
  }

  ngOnInit() {
    
  }

  loadObjects() {
    try {
      this.objectService.getProcessingDocumentByDateRange((this.startDate ? format(parseISO(this.startDate.toISOString()), "yyyy-MM-dd") : null), format(parseISO(this.endDate.toISOString()), "yyyy-MM-dd")).subscribe(response => {
        this.pendingObjects = response.filter(r => !r.isComplete && !r.deactivated);
        this.completedObjects = response.filter(r => r.isComplete);
        this.toastService.presentToast("", "Search Complete", "top", "success", 1000, this.authService.showSearchResult);
      }, error => {
        throw Error;
      })      
    } catch (error) {
      this.toastService.presentToast("", "Error Loading", "top", "danger", 1000);
    }
  }

  onObjectUpdated(event) {
    this.loadObjects();
  }

  async filter() {
    if (!this.startDate) {
      this.startDate = this.commonService.getFirstDayOfTodayMonth();
    }
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