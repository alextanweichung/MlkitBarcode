import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'processes',
        loadChildren: () => import('../processes/pages/processes/processes.module').then(m => m.ProcessesPageModule)
      },
      {
        path: '',
        redirectTo: 'processes',
        pathMatch: 'full'
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
