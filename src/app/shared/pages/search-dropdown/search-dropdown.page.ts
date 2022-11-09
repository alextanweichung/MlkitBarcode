import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  @Input() showHeaderLabel: boolean = true;
  @Input() showBoldHeader: boolean = false;
  @Input() optionLabel: string = 'description';
  @Input() showCode: boolean = false;
  @Input() searchDropdownList: SearchDropdownList[];
  @Input() emptyMessage: string = 'No results found';
  @Output() onActionComplete: EventEmitter<SearchDropdownList> = new EventEmitter();
  tempDropdownList: SearchDropdownList[];
  selected: SearchDropdownList;

  @ViewChild('searchBar', { static: false }) searchBar: IonSearchbar;

  constructor(
    private loadingController: LoadingController,
  ) { }

  ngOnInit() {

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
    if (this.selected && this.selected.id === object.id) {
      this.hideModal(this.selected, false);
    } else {
      this.selected = object;
      this.hideModal(object, true);
    }
  }

  clearSelected() {
    this.selected = null;
  }

  isModalOpen: boolean = false;
  showModal() {
    this.tempDropdownList = this.searchDropdownList;
    this.isModalOpen = true;
  }

  hideModal(object: SearchDropdownList, triggerOutput: boolean = false) {
    if (triggerOutput) {
      this.onActionComplete.emit(object);
    }
    this.isModalOpen = false;
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
    this.hideModal(null, true);
  }
  
}
