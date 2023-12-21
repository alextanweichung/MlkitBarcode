import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DoAcknowledgementService } from '../../services/do-acknowledgement.service';
import { ModalController, NavController, ViewWillEnter } from '@ionic/angular';
import { DOAcknowledegementRequest, DoAcknowledgement } from '../../models/do-acknowledgement';
import { SignaturePad } from 'angular2-signaturepad';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-do-acknowledgement',
  templateUrl: './do-acknowledgement.page.html',
  styleUrls: ['./do-acknowledgement.page.scss'],
})
export class DoAcknowledgementPage implements OnInit, ViewWillEnter {

  cartonTruckLoadingNum:string
  deliveryOrderNum:string
  vehicleSearchDropdownList: SearchDropdownList[] = [];

  uniqueGrouping: Date[] = [];

  objects: DoAcknowledgement[] = [];

  constructor(
    public objectService: DoAcknowledgementService,
    private toastService: ToastService,
    private modalController: ModalController,
    private navController: NavController,
  ) { }

  async ionViewWillEnter(): Promise<void> {
    await this.objectService.loadRequiredMaster();
    this.bindVehicleList();
    this.selectAction();
  }

  ngOnInit() {
  }

  vehicleIds: number[] = [];
  onVechicleSelected(event: any[]) {
    if (event && event !== undefined) {
      this.vehicleIds = event.flatMap(r => r.id);
    }
  }

  bindVehicleList() {
    this.objectService.vehicleMasterList.forEach(r => {
      this.vehicleSearchDropdownList.push({
        id: r.id,
        code: r.code,
        description: r.description
      })
    })
  }

  // Select action
  async selectAction() {
    let object: DOAcknowledegementRequest = {
      cartonTruckLoadingNum : this.cartonTruckLoadingNum,
      vehicledId : this.vehicleIds,
      deliveryOrderNum: this.deliveryOrderNum
    }
    this.getObject(object);
  }

  getObject(request: DOAcknowledegementRequest){
    this.objectService.loadObjects(request).subscribe({
      next:(response)=>{
        this.objects = response.body
      }
    })
  }

  signatureModal: boolean = false;
  selectedDo:DoAcknowledgement;
  acknowledge(object:DoAcknowledgement) {
    this.selectedDo = object;
    this.openSignatureModal();
  }

  openSignatureModal(){
    this.signatureModal = true;
  }

  hideSignatureModal(){
    this.signatureModal = false;
  }

  @ViewChild('signaturePad') signaturePad: SignaturePad;
  signaturePadOptions: Object = {
    'minWidth': 5,
    'canvasWidth': 600,
    'canvasHeight': 400
  };

  cancel() {
    this.signaturePad.clear();
    this.signatureModal = false;
  }

  clear() {
    this.signaturePad.clear();
  }

  save() {
    if (!this.signaturePad.isEmpty()) {
      const imageName = this.selectedDo.deliveryOrderNum + '_Acknowledgement_' + 'signature.png';
      const base64 = this.signaturePad.toDataURL();
      const splitDataURI = base64.split(',')
      const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
      const mimeString = splitDataURI[0].split(':')[1].split(';')[0]
      const ia = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      var blob = new Blob([ia], { type: mimeString })
      var file = new File([blob], imageName, { type: mimeString });
      this.objectService.postFile(file, this.selectedDo.deliveryOrderId, 0).subscribe({
        next: (response) => {
          this.selectedDo = null;
          this.toastService.presentToast("", "DO Acknowledged", "top", "success", 1000);
          this.hideSignatureModal();
        }
      })
    }
  }
}
