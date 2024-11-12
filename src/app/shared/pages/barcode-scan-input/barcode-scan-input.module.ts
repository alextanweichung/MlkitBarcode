import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";
import { BarcodeScanInputPageRoutingModule } from './barcode-scan-input-routing.module';

import { BarcodeScanInputPage } from "./barcode-scan-input.page";
import { IdMappingModule } from "../../pipes/id-mapping/id-mapping.module";
import HideKeyboardModule from '../../utilities/hide-keyboard.module';
import { IdToCodeMappingModule } from "../../pipes/id-to-code-mapping/id-to-code-mapping.module";

@NgModule({
    imports:[
        CommonModule,
        FormsModule,
        IonicModule,
        IdMappingModule,
        IdToCodeMappingModule,
        BarcodeScanInputPageRoutingModule,
        HideKeyboardModule
    ],
    declarations:[BarcodeScanInputPage],
    exports:[
        BarcodeScanInputPage
    ]
})

export class BarcodeScanInputPageModule{

}