import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemCodeInputOfflinePage } from './item-code-input-offline.page';

describe('ItemCodeInputOfflinePage', () => {
  let component: ItemCodeInputOfflinePage;
  let fixture: ComponentFixture<ItemCodeInputOfflinePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemCodeInputOfflinePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemCodeInputOfflinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
