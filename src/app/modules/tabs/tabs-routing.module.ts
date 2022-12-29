import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'approvals',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('../secure/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'approvals',
        loadChildren: () => import('../approvals/pages/approvals/approvals.module').then(m => m.ApprovalsPageModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('../transactions/pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
      },
      {
        path: 'others',
        loadChildren: () => import('../others/pages/others/others.module').then(m => m.OthersPageModule)
      },
      {
        path: 'cards',
        loadChildren: () => import('../secure/cards/cards.module').then(m => m.CardsPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
