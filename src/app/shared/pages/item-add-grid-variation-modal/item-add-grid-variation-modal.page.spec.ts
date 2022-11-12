import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemAddGridVariationMPage } from './item-add-grid-variation-modal.page';

describe('ItemAddGridVariationMPage', () => {
  let component: ItemAddGridVariationMPage;
  let fixture: ComponentFixture<ItemAddGridVariationMPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemAddGridVariationMPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemAddGridVariationMPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
