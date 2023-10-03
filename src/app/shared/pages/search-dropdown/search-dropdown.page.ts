import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { InfiniteScrollCustomEvent, IonSearchbar } from '@ionic/angular';
import { SearchDropdownList } from '../../models/search-dropdown-list';
import { MasterListDetails } from '../../models/master-list-details';
import { ToastService } from 'src/app/services/toast/toast.service';

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
  tempDropdownList: SearchDropdownList[] = [];
  @Input() selectedId: number;
  selected: SearchDropdownList;

  @ViewChild('searchBar', { static: false }) searchBar: IonSearchbar;

  constructor(
    private toastService: ToastService
  ) { }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.selected = null;
    if (changes.masterDropdownList) {
      await this.bindFromMasterList();
      this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
    }
    if (changes.selectedId) {
      if (this.selectedId !== null) {
        this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
      } else {
        this.selected = null;
      }
    }
    if (changes.searchDropdownList) {
      if (this.selectedId !== null) {
        this.selected = this.searchDropdownList?.find(r => r.id === this.selectedId);
      } else {
        this.selected = null;
      }
    }
  }

  ngOnInit() {

  }
  
  setFocus() {
    this.searchBar.setFocus();
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
  async onKeyDown(event) {
    if (event.keyCode === 13) {
      this.searchItem();
    }
  }

  searchItem() {
    this.startIndex = 0;
    this.tempDropdownList = []
    this.assignToTemp(this.startIndex, this.size);
  }

  resetFilter() {
    this.searchText = "";
    this.startIndex = 0;
    this.tempDropdownList = [];
    this.assignToTemp(this.startIndex, this.size);
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
    this.startIndex = 0;
    this.assignToTemp(this.startIndex, this.size);
    this.isModalOpen = true;
  }

  hideModal(object: SearchDropdownList, triggerOutput: boolean = false) {
    this.searchText = "";
    this.tempDropdownList = [];
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

  assignToTemp(startIndex: number, size: number) {
    this.tempDropdownList = [];
    if (this.searchText && this.searchText.length > 0) {
      this.tempDropdownList = [...this.tempDropdownList, ...this.searchDropdownList.filter(r => r.code?.toLowerCase().includes(this.searchText.toLowerCase()) || r.oldCode?.toLowerCase().includes(this.searchText.toLowerCase()) || r.description?.toLowerCase().includes(this.searchText.toLowerCase())).slice(this.startIndex, startIndex + size)];
    } else {
      this.tempDropdownList = [...this.tempDropdownList, ...this.searchDropdownList.slice(startIndex, startIndex + size)];
    }
  }

  startIndex: number = 0;
  readonly size: number = 20;
  onIonInfinite(event) {
    this.startIndex += this.size;
    if (this.searchDropdownList && this.startIndex <= this.searchDropdownList.length) {
      this.assignToTemp(this.startIndex, this.size);
    }    
    setTimeout(() => {
      (event as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

}
