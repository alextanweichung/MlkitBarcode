import { Component, OnInit, ViewChild } from '@angular/core';
import { DebtorApplicationRoot } from '../../../models/debtor-application';
import { DebtorApplicationService } from '../../../services/debtor-application.service';
import { ActivatedRoute } from '@angular/router';
import { IonPopover, NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-debtor-application-detail',
  templateUrl: './debtor-application-detail.page.html',
  styleUrls: ['./debtor-application-detail.page.scss'],
})
export class DebtorApplicationDetailPage implements OnInit {

  objectId: number
  object: DebtorApplicationRoot;

  constructor(
    public objectService: DebtorApplicationService,
    private route: ActivatedRoute,
    private navController: NavController,
    private toastService: ToastService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
        if (!this.objectId) {
          this.navController.navigateBack('/transactions/debtor-application');
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    if (!this.objectId) {
      this.navController.navigateBack('/transactions/sales-order')
    } else {
      this.loadObject();
    }
  }

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        this.object = response;
        console.log("🚀 ~ file: debtor-application-detail.page.ts:48 ~ DebtorApplicationDetailPage ~ this.objectService.getObjectById ~ this.object:", this.object)
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading object', '', 'top', 'danger', 1000);
    }
  }

  /* #region more action popover */

  isPopoverOpen: boolean = false;
  @ViewChild('popover', { static: false }) popoverMenu: IonPopover;
  showPopover(event) {
    try {
      this.popoverMenu.event = event;
      this.isPopoverOpen = true;
    } catch (e) {
      console.error(e);
    }
  }

  /* #endregion */

  showHistoryModal() {
    this.objectService.getWorkflow(this.object.header.customerPreId).subscribe(response => {
      console.log("🚀 ~ file: debtor-application-detail.page.ts:75 ~ DebtorApplicationDetailPage ~ this.objectService.getWorkflow ~ response:", response)
      if (response.length === 0) {
        this.toastService.presentToast('Doc Status', 'No workflow found.', 'top', 'success', 2000);
      } else {
        let currenctStatus = response.filter(r => !r.isCompleted).sort((a,b) => a.sequence-b.sequence)[0].title;
        this.toastService.presentToast('Doc Status', 'Pending ' + currenctStatus, 'top', 'success', 2000);
      }
    }, error => {
      console.error(error);
    })
  }
  
  onFileChange(fileChangeEvent) {
    let file = fileChangeEvent.target.files[0];
    console.log("🚀 ~ file: debtor-application-detail.page.ts:89 ~ DebtorApplicationDetailPage ~ onFileChange ~ file:", file)
  }

}
