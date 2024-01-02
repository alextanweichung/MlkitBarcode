import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchDropdownList } from 'src/app/shared/models/search-dropdown-list';
import { DoAcknowledgementService } from '../../services/do-acknowledgement.service';
import { ModalController, NavController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { DOAcknowledegementRequest, DoAcknowledgement } from '../../models/do-acknowledgement';
import { SignaturePad } from 'angular2-signaturepad';
import { ToastService } from 'src/app/services/toast/toast.service';
import { Directory, FileInfo, Filesystem } from '@capacitor/filesystem';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { AuthService } from 'src/app/services/auth/auth.service';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { GeneralScanInputPage } from 'src/app/shared/pages/general-scan-input/general-scan-input.page';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
   name: string;
   path: string;
   data: string;
}

@Component({
   selector: 'app-do-acknowledgement',
   templateUrl: './do-acknowledgement.page.html',
   styleUrls: ['./do-acknowledgement.page.scss'],
})
export class DoAcknowledgementPage implements OnInit, ViewWillEnter, ViewDidEnter {

   cartonTruckLoadingNum: string
   deliveryOrderNum: string
   vehicleSearchDropdownList: SearchDropdownList[] = [];

   uniqueGrouping: Date[] = [];

   objects: DoAcknowledgement[] = [];

   @ViewChild("ctln", { static: false }) ctln: GeneralScanInputPage;
   @ViewChild("don", { static: false }) don: GeneralScanInputPage;

   constructor(
      public objectService: DoAcknowledgementService,
      private authService: AuthService,
      private toastService: ToastService,
      private loadingService: LoadingService,
      private modalController: ModalController,
      private navController: NavController,
   ) { }

   async ionViewWillEnter(): Promise<void> {
      await this.objectService.loadRequiredMaster();
      await this.bindVehicleList();
      // this.selectAction();
   }

   ionViewDidEnter(): void {
      this.ctln.setFocus();
   }

   ngOnInit() {

   }

   moduleControl: ModuleControl[] = [];
   fileSizeLimit: number = 1 * 1024 * 1024;
   loadModuleControl() {
      try {
         this.authService.moduleControlConfig$.subscribe(obj => {
            this.moduleControl = obj;
            let uploadFileSizeLimit = this.moduleControl.find(x => x.ctrlName === "UploadFileSizeLimit")?.ctrlValue;
            this.fileSizeLimit = Number(uploadFileSizeLimit) * 1024 * 1024;
         })
      } catch (e) {
         console.error(e);
      }
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
      try {      
         Filesystem.readdir({
            path: IMAGE_DIR,
            directory: Directory.Data
         }).then(
            async (result) => {
               result.files.forEach(async f => {
                  await Filesystem.deleteFile({
                     directory: Directory.Data,
                     path: `${IMAGE_DIR}/${f.name}`
                  })
               })
            },
            async (err) => {
               // Folder does not yet exists!
               await Filesystem.mkdir({
                  path: IMAGE_DIR,
                  directory: Directory.Data
               });
            }
         ).then(async (_) => {
               await this.loadingService.dismissLoading();
            });
      } catch (error) {
         console.error(error);
      }
      let object: DOAcknowledegementRequest = {
         truckArrangementNum: this.cartonTruckLoadingNum,
         vehicledId: this.vehicleIds,
         deliveryOrderNum: this.deliveryOrderNum
      }
      this.getObject(object);
   }

   async getObject(request: DOAcknowledegementRequest) {
      try {
         await this.loadingService.showLoading();
         this.objectService.loadObjects(request).subscribe({
            next: async (response) => {
               this.objects = response.body
               await this.loadingService.dismissLoading();
            },
            error: async (error) => {
               await this.loadingService.dismissLoading();
               console.error(error);
            }
         })
      } catch (error) {
         await this.loadingService.dismissLoading();
         console.error(error);
      } finally {
         await this.loadingService.dismissLoading();
      }
   }

   signatureModal: boolean = false;
   selectedDo: DoAcknowledgement;
   acknowledge(object: DoAcknowledgement) {
      this.selectedDo = object;
      this.openSignatureModal();
   }

   openSignatureModal() {
      this.signatureModal = true;
   }

   hideSignatureModal() {
      this.signaturePad.clear();
      this.signatureModal = false;
   }

   @ViewChild("signaturePad") signaturePad: SignaturePad;
   signaturePadOptions: Object = {
      "minWidth": 5,
      "canvasWidth": 600,
      "canvasHeight": 400
   };

   cancel() {
      this.signaturePad.clear();
      this.signatureModal = false;
   }

   clear() {
      this.signaturePad.clear();
   }

   images: LocalFile[] = [];
   async save() {
      if (!this.signaturePad.isEmpty()) {
         const fileName = this.selectedDo.deliveryOrderNum + "_Acknowledgement_" + "signature.png";
         const base64Data = this.signaturePad.toDataURL();
         try {
            this.images = [];
            await this.loadingService.showLoading();
            const savedFile = await Filesystem.writeFile({
               path: `${IMAGE_DIR}/${fileName}`,
               data: base64Data,
               directory: Directory.Data,
               recursive: true
            });
            Filesystem.readdir({
               path: IMAGE_DIR,
               directory: Directory.Data
            }).then(
               async (result) => {
                  await this.loadFileData(result.files);
               },
               async (err) => {
                  // Folder does not yet exists!
                  await Filesystem.mkdir({
                     path: IMAGE_DIR,
                     directory: Directory.Data
                  });
               }
            ).then(async (_) => {
                  await this.loadingService.dismissLoading();
               });
         } catch (e) {
            console.error(e);
            await this.loadingService.dismissLoading();
         }
         finally {
            await this.loadingService.dismissLoading();
         }
      }
   }

   fileToDelete: LocalFile[] = [];
   async loadFileData(fileNames: FileInfo[]) {
      try {
         this.fileToDelete = [];
         for (let f of fileNames) {
            const filePath = `${IMAGE_DIR}/${f.name}`;
            const readFile = await Filesystem.readFile({
               path: filePath,
               directory: Directory.Data
            });
            if (f.size > this.fileSizeLimit) {
               // this.fileToDelete.push({
               //    name: f.name,
               //    path: filePath,
               //    data: `data:image/jpeg;base64,${readFile.data}`
               // });
               this.toastService.presentToast('File size too large', '', 'top', 'danger', 1500);
            } else {
               this.images.push({
                  name: f.name,
                  path: filePath,
                  data: `data:image/jpeg;base64,${readFile.data}`
               });
               if (this.images && this.images.length > 0) {
                  const response = await fetch(this.images[0].data);
                  const blob = await response.blob();
                  const formData = new FormData();
                  formData.append('file', blob, this.images[0].name);
                  this.objectService.postFile(formData, this.selectedDo.deliveryOrderId, 0).subscribe({
                     next: async (response) => {
                        this.selectedDo = null;
                        this.toastService.presentToast("", "DO Acknowledged", "top", "success", 1000);
                        this.hideSignatureModal();
                        await this.selectAction();
                        await this.deleteImage({
                           name: f.name,
                           path: filePath,
                           data: `data:image/jpeg;base64,${readFile.data}`
                        });
                     },
                     error: (error) => {
                        console.error(error);
                     }
                  })
               }
            }
         }
      } catch (e) {
         console.error(e);
      }
   }

   async deleteImage(file: LocalFile) {
      try {
         await Filesystem.deleteFile({
            directory: Directory.Data,
            path: file.path
         });
         this.signaturePad.clear();
      } catch (e) {
         console.error(e);
      }
   }

   onCTLNChanged(event) {
      if (event) {
         this.cartonTruckLoadingNum = event;
      } else {
         this.cartonTruckLoadingNum = null;
      }
   }

   onDONChanged(event) {
      if (event) {
         this.deliveryOrderNum = event;
      } else {
         this.deliveryOrderNum = null;
      }
   }

   /* #region  barcode scanner */

   scanActive: boolean = false;
   onCameraStatusChanged(event) {
      this.scanActive = event;
      if (this.scanActive) {
         document.body.style.background = "transparent";
      }
   }

   async onCTLNDoneScanning(event: string) {
      if (event) {
         await this.onCTLNChanged(event);
      }
   }

   async onDONDoneScanning(event: string) {
      if (event) {
         await this.onDONChanged(event);
      }
   }

   stopScanner() {
      BarcodeScanner.stopScan();
      // this.scanActive = false;
      this.onCameraStatusChanged(false);
   }

   /* #endregion */

}
