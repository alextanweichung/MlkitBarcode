import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { TransactionProcessingDoc } from '../../models/transaction-processing';
import { TransactionProcessingService } from '../../services/transaction-processing.service';

@Component({
  selector: 'app-transaction-processing',
  templateUrl: './transaction-processing.page.html',
  styleUrls: ['./transaction-processing.page.scss'],
})
export class TransactionProcessingPage implements OnInit {

  @Input() parentType: string;
  @Input() processType: string;

  @Input() pendingObjects: TransactionProcessingDoc[] = [];
  @Input() completedObjects: TransactionProcessingDoc[] = [];
  @Output() onObjectUpdated: EventEmitter<TransactionProcessingDoc> = new EventEmitter();

  selectedSegment: string = 'pending';

  constructor(
    private transactionProcessingService: TransactionProcessingService,
    private navController: NavController,
    private alertController: AlertController,
    private toastService: ToastService
  ) { }

  ngOnInit() {

  }

  async presentConfirmAlert(action: string, docId: number, docNum: string) {    
    const alert = await this.alertController.create({
      header: 'Are you sure to ' + action + ' ' + docNum + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.updateDoc(action, docId);
          },
        },
      ],
    });

    await alert.present();
  }

  updateDoc(action: string, docId: number) {    
    // this.transactionProcessingService.updateDocumentStatus(action, docId).subscribe(async response => {
    //   console.log("🚀 ~ file: transaction-processing.page.ts ~ line 62 ~ TransactionProcessingPage ~ this.transactionProcessingService.updateDocumentStatus ~ response", response)
    //   if (response.status == 204) {
    //     this.toastService.presentToast("Doc review is completed.", "", "top", "success", 1500);
    //     this.onObjectUpdated.emit(this.objects.find(r => r.docId === docId));
    //   }
    // }, error => {
    //   console.log(error);
    // })
  }

  async openDetail(docId: number) {
    let navigationExtras: NavigationExtras;
    if (this.parentType.toLowerCase() === 'quotation') {
      navigationExtras = {
        queryParams: {
          quotationId: docId,
          parent: this.processType
        }
      }
    }
    if (this.parentType.toLowerCase() === 'sales-order') {
      navigationExtras = {
        queryParams: {
          salesOrderId: docId,
          parent: this.processType
        }
      }
    }
    this.navController.navigateForward(`/transactions/${this.parentType.toLowerCase()}/${this.parentType.toLowerCase()}-detail`, navigationExtras);
  }

}
