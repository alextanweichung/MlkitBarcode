import { Component, OnInit } from '@angular/core';
import { TransferConfirmationService } from '../../services/transfer-confirmation.service';
import { NavController, ViewWillEnter } from '@ionic/angular';
import { TransferConfirmationRoot } from '../../models/inter-transfer';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-transfer-confirmation',
  templateUrl: './transfer-confirmation.page.html',
  styleUrls: ['./transfer-confirmation.page.scss'],
})
export class TransferConfirmationPage implements OnInit, ViewWillEnter {

  pendingList: TransferConfirmationRoot[] = [];

  constructor(
    public objectService: TransferConfirmationService,
    private authService: AuthService,
    private navController: NavController
  ) {

  }

  ionViewWillEnter(): void {
    this.loadPendingList();
  }

  ngOnInit() {

  }

  loadPendingList() {
    if (this.selectedLocationId) {
      this.objectService.getPendingList(this.selectedLocationId).subscribe(response => {
        this.pendingList = response;
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

  selectedObject: TransferConfirmationRoot;
  goToDetails(object: TransferConfirmationRoot) {
    this.selectedObject = object;
    this.selectedObject.line.forEach(r => {
      r.qtyReceive = r.qty;
    })
    this.objectService.setSelectedObject(this.selectedObject);
    this.navController.navigateForward("/transactions/transfer-confirmation/transfer-confirmation-item");
  }

}
