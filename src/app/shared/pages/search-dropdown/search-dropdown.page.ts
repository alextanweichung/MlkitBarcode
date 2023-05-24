import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';
import { SearchDropdownList } from '../../models/search-dropdown-list';
import { MasterListDetails } from '../../models/master-list-details';

@Component({
  selector: 'app-search-dropdown',
  templateUrl: './search-dropdown.page.html',
  styleUrls: ['./search-dropdown.page.scss'],
})
export class SearchDropdownPage implements OnInit, OnChanges {

  @Input() title: string = "Search";
  @Input() optionLabel: string = 'description';
  @Input() searchDropdownList: SearchDropdownList[] = [];
  @Input() masterDropdownList: MasterListDetails[] = [];
  @Input() emptyMessage: string = 'No results found';
  @Input() disabled: boolean = false;
  @Output() onActionComplete: EventEmitter<SearchDropdownList> = new EventEmitter();
  tempDropdownList: SearchDropdownList[];
  @Input() selectedId: number;
  selected: SearchDropdownList;

  @ViewChild('searchBar', { static: false }) searchBar: IonSearchbar;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.masterDropdownList) {
      this.bindFromMasterList();
      this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
    }
    if (changes.selectedId || changes.searchDropdownList) {
      if (this.selectedId) {
        this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
      } else {
        this.selected = null;
      }
    }
  }

  ngOnInit() {
  }

  bindFromMasterList() {
    if (this.masterDropdownList && this.masterDropdownList.length > 0) {
      this.masterDropdownList.forEach(r => {
        this.searchDropdownList.push({
          id: r.id,
          code: r.code,
          description: r.description
        })
      })
    }
  }

  searchText: string = '';
  async keypress(event) {
    if (event.keyCode === 13) {
      if (this.searchText.length > 0) {
        this.tempDropdownList = this.searchDropdownList.filter(r => r.code.toLowerCase().includes(this.searchText.toLowerCase()) || r.oldCode?.toLowerCase().includes(this.searchText.toLowerCase()) || r.description.toLowerCase().includes(this.searchText.toLowerCase()));
      } else {
        this.tempDropdownList = this.searchDropdownList;
      }
    } else {
      this.tempDropdownList = this.searchDropdownList;
    }
  }

  resetFilter() {
    this.tempDropdownList = this.searchDropdownList;
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

  // Cancel
  cancel() {
    // Dismiss modal
    this.hideModal(null);
  }

}
