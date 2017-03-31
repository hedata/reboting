import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { Ng2FileInputModule } from 'ng2-file-input';

import { AppComponent } from './app.component';
import { ImportCsvComponent } from './components/import-csv/import-csv.component';

import { DataService } from './services/data.service';

@NgModule({
  declarations: [
    AppComponent,
    ImportCsvComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule,
    Ng2FileInputModule.forRoot({
      extensions: ['csv'],
      showPreviews: false,
      multiple: false
    }),
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
