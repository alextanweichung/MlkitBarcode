import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { SearchDropdownList } from '../../models/search-dropdown-list';

@Component({
  selector: 'app-search-multi-dropdown',
  templateUrl: './search-multi-dropdown.page.html',
  styleUrls: ['./search-multi-dropdown.page.scss'],
})
export class SearchMultiDropdownPage implements OnInit, OnChanges {

  @Input() title: string = "Search";
  @Input() showHeaderLabel: boolean = true;
  @Input() showBoldHeader: boolean = false;
  @Input() optionLabel: string = 'description';
  @Input() showCode: boolean = false;
  @Input() searchDropdownList: SearchDropdownList[];
  @Output() onActionComplete: EventEmitter<SearchDropdownList[]> = new EventEmitter();
  tempDropdownList: SearchDropdownList[];
  @Input() selectedIds: number[] = [];
  selected: SearchDropdownList[] = [];

  @ViewChild('searchBar', { static: false }) searchBar: IonSearchbar;
  
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedIds || changes.searchDropdownList) {
      if (this.selectedIds) {
        this.selected = this.searchDropdownList.filter(r => this.selectedIds.includes(r.id));
      } else {
        this.selected = null;
      }
    }
  }

  ngOnInit() {
  }

  searchText: string = '';
  async keypress(event) {
    if (event.keyCode === 13) {
      if (this.searchText.length > 0) {
        this.tempDropdownList = this.searchDropdownList.filter(r => r.code.toLowerCase().includes(this.searchText.toLowerCase()) || r.description.toLowerCase().includes(this.searchText.toLowerCase()));
      } else {
        this.tempDropdownList = this.searchDropdownList;
      }
    } else {
      this.tempDropdownList = this.searchDropdownList;
    }
    // this.searchBar.setFocus();
  }

  resetFilter() {
    this.tempDropdownList = this.searchDropdownList;
  }
  
  itemChecked(event, object: SearchDropdownList) {
    if (event.detail.checked) {
      if (this.selected.findIndex(r => r.id === object.id) > -1) {
        // already in
      } else {
        this.selected.push(object);
      }
    } else {
      this.selected.splice(this.selected.findIndex(r => r.id === object.id), 1);
    }
  }

  clearSelected() {
    this.selected = [];
  }

  isModalOpen: boolean = false;
  showModal() {
    this.tempDropdownList = this.searchDropdownList;
    this.isModalOpen = true;
  }

  hideModal(object: SearchDropdownList[]) {
    this.onActionComplete.emit(object);
    this.isModalOpen = false;
  }

  // Cancel
  cancel() {
    // Dismiss modal
    this.hideModal(null);
  }

  apply() {
    this.hideModal(this.tempDropdownList.filter(r => r.checked));
  }

}
