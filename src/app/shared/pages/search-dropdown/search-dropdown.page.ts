import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { IonSearchbar, LoadingController, ModalController } from '@ionic/angular';
import { SearchDropdownList } from '../../models/search-dropdown-list';

@Component({
  selector: 'app-search-dropdown',
  templateUrl: './search-dropdown.page.html',
  styleUrls: ['./search-dropdown.page.scss'],
})
export class SearchDropdownPage implements OnInit {

  @Input() title: string = "Search";
  @Input() searchDropdownList: SearchDropdownList[];
  tempDropdownList: SearchDropdownList[];

  @ViewChild('searchBar', { static: false }) searchBar: IonSearchbar;

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
  ) { }

  ngOnInit() {
    this.tempDropdownList = this.searchDropdownList;
  }  

  async searchItem(event) {
    if (event.detail.value) {
      if (Capacitor.getPlatform() !== 'web') {
        Keyboard.hide();
      }
      await this.showLoading();
      this.tempDropdownList = this.searchDropdownList.filter(r => r.code.toLowerCase().includes(event.detail.value.toLowerCase()) || r.description.toLowerCase().includes(event.detail.value.toLowerCase()));
      await this.hideLoading();
    } else {
      this.tempDropdownList = this.searchDropdownList;
    }

    this.searchBar.setFocus();
  }
  
  chooseThis(object: SearchDropdownList) {
    console.log("🚀 ~ file: search-dropdown.page.ts ~ line 44 ~ SearchDropdownPage ~ chooseThis ~ object", object)
    this.modalController.dismiss(object);
  }

  /* #region  misc */

  async showLoading() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'circles',
    });

    loading.present();
  }

  async hideLoading() {
    this.loadingController.dismiss();
  }

  /* #endregion */

  // Cancel
  cancel() {
    // Dismiss modal
    this.modalController.dismiss();
  }  

  // Apply filter
  apply() {
    // Add filter logic here...
    // ...

    // Dismiss modal and apply filters
    this.modalController.dismiss();
  }

}
