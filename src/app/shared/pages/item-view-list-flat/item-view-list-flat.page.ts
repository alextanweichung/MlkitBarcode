import { Component, Input, OnInit } from '@angular/core';
import { MasterListDetails } from '../../models/master-list-details';

@Component({
  selector: 'app-item-view-list-flat',
  templateUrl: './item-view-list-flat.page.html',
  styleUrls: ['./item-view-list-flat.page.scss'],
})
export class ItemViewListFlatPage implements OnInit {

  @Input() isWithSo: boolean = true;
  @Input() data: any;
  @Input() isPicking: boolean = false;
  @Input() isPacking: boolean = false;
  
  @Input() itemVariationXMasterList: MasterListDetails[] = [];
  @Input() itemVariationYMasterList: MasterListDetails[] = [];
  
  constructor() { }

  ngOnInit() {

  }

}
