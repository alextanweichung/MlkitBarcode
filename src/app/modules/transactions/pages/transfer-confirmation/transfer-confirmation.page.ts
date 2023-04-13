import { Component, OnInit } from '@angular/core';
import { TransferConfirmationService } from '../../services/transfer-confirmation.service';
import { ViewWillEnter } from '@ionic/angular';
import { TransferConfirmationRoot } from '../../models/inter-transfer';

@Component({
  selector: 'app-transfer-confirmation',
  templateUrl: './transfer-confirmation.page.html',
  styleUrls: ['./transfer-confirmation.page.scss'],
})
export class TransferConfirmationPage implements OnInit, ViewWillEnter {

  pendingList: TransferConfirmationRoot[] = [];

  constructor(
    public objectService: TransferConfirmationService
  ) { }

  ionViewWillEnter(): void {

  }

  ngOnInit() {
    this.loadPendingList();
  }

  loadPendingList() {
    if (this.selectedLocationId) {
      this.objectService.getPendingList(this.objectService.locationMasterList.find(r => r.id === this.selectedLocationId).code).subscribe(response => {
        this.pendingList = response;
        console.log("🚀 ~ file: transfer-confirmation.page.ts:31 ~ TransferConfirmationPage ~ this.objectService.getPendingList ~ this.pendingList:", this.pendingList)
      }, error => {
        console.error(error);
      })
    }
  }

  selectedLocationId: number;
  onLocationChanged(event) {
    this.selectedLocationId = event.id;
    this.loadPendingList();
  }

  isModalOpen: boolean = false;
  selectedObject: TransferConfirmationRoot;
  showModal(object: TransferConfirmationRoot) {
    console.log("🚀 ~ file: transfer-confirmation.page.ts:47 ~ TransferConfirmationPage ~ showModal ~ object:", object)
    this.selectedObject = object;
    this.selectedObject.line.forEach(r => {
      r.qtyReceive = r.qty;
    })
    this.isModalOpen = true;
  }

  hideModal() {
    this.isModalOpen = false;
  }

  onModalHide() {
    this.selectedObject = null;
    this.isModalOpen = false;
  }

}
