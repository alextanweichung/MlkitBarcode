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
  @Output() onObjectUpdated: EventEmitter<number> = new EventEmitter();

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
      cssClass: 'custom-alert',
      header: 'Are you sure to ' + action + ' ' + docNum + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          role: 'confirm',
          cssClass: 'success',
          handler: () => {
            this.updateDoc(action, docId);
          },
        },
      ],
    });

    await alert.present();
  }

  updateDoc(action: string, docId: number) {
    try {
      this.transactionProcessingService.updateDocumentStatus(action, docId).subscribe(async response => {
        if (response.status == 204) {
          this.toastService.presentToast("Doc review is completed.", "", "bottom", "success", 1000);
          this.onObjectUpdated.emit(docId);
        }
      }, error => {
        throw Error;
      })
    } catch (error) {
      this.toastService.presentToast('Update error', '', 'top', 'danger', 1000);
    }
  }

  async openDetail(docId: number) {
    let navigationExtras: NavigationExtras;
    if (this.parentType.toLowerCase() === 'quotation') {
      navigationExtras = {
        queryParams: {
          objectId: docId,
          parent: this.processType
        }
      }
    }
    if (this.parentType.toLowerCase() === 'sales-order') {
      navigationExtras = {
        queryParams: {
          objectId: docId,
          parent: this.processType
        }
      }
    }
    if (this.parentType.toLowerCase() === 'purchase-order') {
      navigationExtras = {
        queryParams: {
          objectId: docId,
          parent: this.processType
        }
      }
    }
    this.navController.navigateForward(`/transactions/${this.parentType.toLowerCase()}/${this.parentType.toLowerCase()}-detail`, navigationExtras);
  }

}
