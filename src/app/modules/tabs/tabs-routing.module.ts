import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../secure/home/home.module').then(m => m.HomePageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'transactions',
        loadChildren: () => import('../transactions/pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
      },
      {
        path: 'payments',
        loadChildren: () => import('../secure/payments/payments.module').then(m => m.PaymentsPageModule)
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
