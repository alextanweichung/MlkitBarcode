import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController, NavController } from '@ionic/angular';
import { InterTransferService } from 'src/app/modules/transactions/services/inter-transfer.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-inter-transfer-header',
  templateUrl: './inter-transfer-header.page.html',
  styleUrls: ['./inter-transfer-header.page.scss'],
})
export class InterTransferHeaderPage implements OnInit {

  objectForm: FormGroup;
  
  constructor(
    public objectService: InterTransferService,
    private commonService: CommonService,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private formBuilder: FormBuilder
  ) { 
    this.newObjectForm();
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      interTransferId: [0],
      interTransferNum: [null],
      trxDate: [this.commonService.getDateWithoutTimeZone(this.commonService.getTodayDate())],
      locationId: [null, [Validators.required]],
      toLocationId: [null, [Validators.required]],
      shipMethodId: [null],
      typeCode: ["IL", [Validators.required]],
      sourceType: ['M']
    })
    this.objectForm.controls.typeCode.disable();
    this.objectForm.controls.typeCode.updateValueAndValidity();
  }

  ngOnInit() {
    
  }

  onLocationSelected(event) {
    if (event) {
      this.objectForm.patchValue({ locationId: event.id });
    }
  }

  onToLocationSelected(event) {
    if (event) {
      this.objectForm.patchValue({ toLocationId: event.id });
    }
  }

  onShipMethodSelected(event) {
    if (event) {
      this.objectForm.patchValue({ shipMethodId: event.id });
    }
  }

  async cancelInsert() {
    try {
      const actionSheet = await this.actionSheetController.create({
        header: 'Are you sure to cancel?',
        cssClass: 'custom-action-sheet',
        buttons: [
          {
            text: 'Yes',
            role: 'confirm',
          },
          {
            text: 'No',
            role: 'cancel',
          }]
      });
      await actionSheet.present();
      const { role } = await actionSheet.onWillDismiss();
      if (role === 'confirm') {
        this.objectService.resetVariables();
        this.navController.navigateBack('/transactions/inter-transfer');
      }      
    } catch (e) {
      console.error(e);
    }
  }

  async nextStep() {
    try {
      await this.objectService.setHeader(this.objectForm.getRawValue());
      this.navController.navigateForward('/transactions/inter-transfer/inter-transfer-item');
    } catch (e) {
      console.error(e);
    }
  }

}
