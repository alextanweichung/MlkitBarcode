import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ViewWillEnter, NavController, ActionSheetController, AlertController, IonPopover } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { PrecisionList } from 'src/app/shared/models/precision-list';
import { CommonService } from 'src/app/shared/services/common.service';
import { TransferInRoot, TransferInLine } from '../../../models/transfer-in';
import { TransferInService } from '../../../services/transfer-in.service';

@Component({
  selector: 'app-transfer-in-detail',
  templateUrl: './transfer-in-detail.page.html',
  styleUrls: ['./transfer-in-detail.page.scss'],
})
export class TransferInDetailPage implements OnInit, ViewWillEnter {

  objectId: number;
  object: TransferInRoot;
  
  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private navController: NavController,
    public objectService: TransferInService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    try {
      this.route.queryParams.subscribe(params => {
        this.objectId = params['objectId'];
      })
    } catch (e) {
      console.error(e);
    }
  }

  ionViewWillEnter(): void {

  }

  ngOnInit() {
    if (this.objectId && this.objectId > 0) {
      this.loadObject();
    } else {
      this.toastService.presentToast('', 'Invalid Transfer In.', 'top', 'warning', 1000);
      this.navController.navigateBack('/transactions/transfer-in');
    }
    this.loadModuleControl();
  }
  
  loadModuleControl() {
    try {
      
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error loading module control', '', 'top', 'danger', 1000);
    }
  }

  loadObject() {
    try {
      this.objectService.getObjectById(this.objectId).subscribe(response => {
        console.log("🚀 ~ file: transfer-in-detail.page.ts:66 ~ TransferInDetailPage ~ this.objectService.getObjectById ~ response:", response)
        this.object = response;
      }, error => {
        throw error;
      })
    } catch (e) {
      console.error(e);
      this.toastService.presentToast('Error', 'Transfer In', 'top', 'danger', 1000);
    }
  }
  
}
