import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, FileInfo, Filesystem } from '@capacitor/filesystem';
import { NavController, ActionSheetController, LoadingController, Platform, AlertController } from '@ionic/angular';
import { format } from 'date-fns';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { MasterListDetails } from 'src/app/shared/models/master-list-details';
import { ModuleControl } from 'src/app/shared/models/module-control';
import { CommonService } from 'src/app/shared/services/common.service';
import { CashDeposit } from '../../../models/cash-deposit';
import { CashDepositService } from '../../../services/cash-deposit.service';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string;
  path: string;
  data: string;
}

@Component({
  selector: 'app-cash-deposit-edit',
  templateUrl: './cash-deposit-edit.page.html',
  styleUrls: ['./cash-deposit-edit.page.scss'],
})
export class CashDepositEditPage implements OnInit {

  objectId: number;
  objectForm: FormGroup;
  object: CashDeposit;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navController: NavController,
    private toastService: ToastService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private objectService: CashDepositService,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private plt: Platform
  ) {
    this.route.queryParams.subscribe(params => {
      this.objectId = params['objectId'];
    })
    this.newObjectForm();
  }

  newObjectForm() {
    this.objectForm = this.formBuilder.group({
      posCashDepositId: 0,
      posCashDepositNum: [null],
      depositBy: [null],
      depositAmount: [0, [Validators.required]],
      depositDateTime: [new Date, [Validators.required]],
      depositFileId: [null],
      depositSlipNum: [null],
      paymentMethodId: [null, [Validators.required]],
      sequence: [0]
    })
  }

  ngOnInit() {
    this.loadMasterList();
    this.loadModuleControl();
    if (this.objectId) {
      this.loadObject();
    }
  }

  paymentMethodMasterList: MasterListDetails[] = [];
  loadMasterList() {
    this.objectService.getMasterList().subscribe(response => {
      this.paymentMethodMasterList = response.filter(x => x.objectName == 'PaymentMethod').flatMap(src => src.details).filter(y => y.deactivated == 0);
    }, error => {
      console.log(error);
    })
  }

  loadObject() {
    this.objectService.getObject(this.objectId).subscribe(response => {
      this.object = response;
      this.objectForm.patchValue(this.object);
      this.date_value = this.commonService.convertDateFormat(this.object.depositDateTime);
      this.date = format(this.date_value, 'MMM d, yyyy');
      this.time_value = this.commonService.convertUtcDate(this.object.depositDateTime);
      this.time = format(this.commonService.convertDateFormat(this.object.depositDateTime), 'hh:mm a');
    }, error => {
      console.log(error);
    })
  }

  moduleControl: ModuleControl[] = [];
  fileSizeLimit: number = 1 * 1024 * 1024;
  loadModuleControl() {    
    this.authService.moduleControlConfig$.subscribe(obj => {
      this.moduleControl = obj;
      let uploadFileSizeLimit = this.moduleControl.find(x => x.ctrlName === "UploadFileSizeLimit")?.ctrlValue;
      this.fileSizeLimit = Number(uploadFileSizeLimit) * 1024 * 1024;
    })
  }

  /* #region  date part */

  date_active: boolean = false;
  time_active: boolean = false;

  date: any;
  time: any;
  date_value: Date;
  time_value: Date;

  // Toggle date
  toggleDate() {
    this.date_active = this.date_active ? false : true;
    this.time_active = false;
  }

  // On date select
  onDateSelect(event: any) {
    let date = new Date(event.detail.value);
    this.date_value = this.commonService.convertUtcDate(date);
    this.date = format(date, 'MMM d, yyyy');
    this.date_active = false;
    this.bindDateTimeToForm();
  }

  // Toggle time
  toggleTime() {
    this.time_active = this.time_active ? false : true;
    this.date_active = false;
  }

  // On time select
  onTimeSelect(event: any) {
    let time = new Date(event.detail.value);
    this.time_value = this.commonService.convertUtcDate(time);
    this.time = format(time, 'hh:mm a');
    this.time_active = false;
    this.bindDateTimeToForm();
  }

  bindDateTimeToForm() {
    this.objectForm.patchValue({ depositDateTime: new Date(this.date_value.getFullYear(), this.date_value.getMonth(), this.date_value.getDate(), this.time_value.getHours(), this.time_value.getMinutes(), this.time_value.getSeconds()) })
  }

  /* #endregion */


  /* #region  attachment */

  images: LocalFile[] = [];

  async selectImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Prompt // Camera, Photos or Prompt!
    });

    if (image) {
      this.saveImage(image);
    }
  }

  // Create a new file from a capture image
  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data,
      directory: Directory.Data,
      recursive: true
    });

    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
    this.loadFiles();
  }

  async loadFiles() {
    this.images = [];

    const loading = await this.loadingController.create({
      message: 'Loading data...'
    });
    await loading.present();

    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data
    })
      .then(
        (result) => {
          this.loadFileData(result.files);
        },
        async (err) => {
          // Folder does not yet exists!
          await Filesystem.mkdir({
            path: IMAGE_DIR,
            directory: Directory.Data
          });
        }
      )
      .then((_) => {
        loading.dismiss();
      });
  }

  // Get the actual base64 data of an image
  // base on the name of the file
  fileToDelete: LocalFile[] = [];
  async loadFileData(fileNames: FileInfo[]) {
    this.fileToDelete = [];
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f.name}`;
      
      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data
      });
      if (f.size > this.fileSizeLimit) {
        this.fileToDelete.push({
          name: f.name, 
          path: filePath,
          data: `data:image/jpeg;base64,${readFile.data}`
        });
        this.toastService.presentToast('File size too large', '', 'top', 'danger', 1500);
      } else {
        this.images.push({
          name: f.name,
          path: filePath,
          data: `data:image/jpeg;base64,${readFile.data}`
        });
      }
    }
    this.fileToDelete.forEach(e => {
      this.deleteImage(e);
    });
  }

  // https://ionicframework.com/docs/angular/your-first-app/3-saving-photos
  private async readAsBase64(photo: Photo) {
    if (this.plt.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async startUpload(file: LocalFile, objectId: number, fileId: number) {
    const response = await fetch(file.data);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('file', blob, file.name);
    this.objectService.uploadFile(objectId, fileId, formData).subscribe(response => {

    }, error => {
      console.log(error);
    })
    // this.uploadData(formData, objectId, fileId);
  }

  async deleteImage(file: LocalFile) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
    this.loadFiles();
  }

  /* #endregion */

  async removeDir() {
    await Filesystem.rmdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
      recursive: true
    })
  }

  async cancelEdit() {
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
      this.removeDir();
      let navigationExtras: NavigationExtras = {
        queryParams: {
          objectId: this.objectId
        }
      }
      this.navController.navigateRoot('/transactions/cash-deposit/cash-deposit-detail', navigationExtras);
    }
  }

  async nextStep() {
    if (this.objectForm.valid && this.images.length === 1) {
      const alert = await this.alertController.create({
        header: 'Are you sure to proceed?',
        buttons: [
          {
            text: 'OK',
            cssClass: 'success',
            role: 'confirm',
            handler: async () => {
              await this.updateObject();
            },
          },
          {
            text: 'Cancel',
            cssClass: 'cancel',
            role: 'cancel'
          },
        ],
      });
      await alert.present();
    } else {
      this.toastService.presentToast('Error', 'Please fill required fields & attach 1 file to continue', 'top', 'danger', 2000);
    }
  }

  async updateObject() {
    console.log("🚀 ~ file: cash-deposit-edit.page.ts:338 ~ CashDepositEditPage ~ updateObject ~ this.objectForm.value", this.objectForm.value)
    let response = await this.objectService.updateObject(this.objectForm.value);
    if (response.status === 204) {
      await this.startUpload(this.images[0], this.object.posCashDepositId, this.object.depositFileId ?? 0);
      this.toastService.presentToast('Update Complete', '', 'top', 'success', 1000);
      await this.removeDir();
      this.navController.navigateRoot('transactions/cash-deposit');
    }
  }

}
