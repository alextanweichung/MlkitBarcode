import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';
import { BulkConfirmReverse, TransactionProcessingDoc } from '../../models/transaction-processing';
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

  @Input() selectedSegment: string = 'pending';

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
      inputs: [
        {
          name: 'actionreason',
          type: 'textarea',
          placeholder: 'Please enter Reason',
          value: ''
        }
      ],
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          cssClass: 'success',
          handler: (data) => {
            if (action === 'REJECT' && this.processType === 'APPROVALS') {
              if (!data.actionreason && data.actionreason.length === 0) {
                this.toastService.presentToast('Please enter reason', '', 'top', 'danger', 1000);
                return false;
              } else {
                this.updateDoc(action, [docId.toString()], data.actionreason);
              }
            } else {
              this.updateDoc(action, [docId.toString()], data.actionreason);
            }
          },
        },
        {
          text: 'Cancel',
          role: 'cancel'
        },
      ],
    });
    await alert.present();
  }

  updateDoc(action: string, listOfDoc: string[], actionReason: string) {    
    let bulkConfirmReverse: BulkConfirmReverse = {
      status: action,
      reason: actionReason,
      docId: listOfDoc.map(i => Number(i))
    }
    try {
      this.transactionProcessingService.bulkUpdateDocumentStatus(bulkConfirmReverse).subscribe(async response => {
        if (response.status == 204) {
          this.toastService.presentToast("Doc review is completed.", "", "top", "success", 1000);
          this.onObjectUpdated.emit(listOfDoc.map(i => Number(i))[0]);
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
