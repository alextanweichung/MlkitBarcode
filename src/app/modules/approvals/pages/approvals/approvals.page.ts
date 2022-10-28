import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';

const subModuleCode: string = 'MATR';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.page.html',
  styleUrls: ['./approvals.page.scss'],
})
export class ApprovalsPage implements OnInit {

  showQuotationReview: boolean = false;
  showQuotationApproval: boolean = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.menuModel$.subscribe(obj => {
      // let thisSubMod = obj.flatMap(r => r.items)
    })
  }

}
