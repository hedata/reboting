import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { Ng2FileInputModule } from 'ng2-file-input';

import { DataService } from './services/data.service';

import { uploadState } from './stores/upload-state.store';
import { response } from './stores/response.store';

import { AppComponent } from './app.component';
import { ImportCsvComponent } from './components/import-csv/import-csv.component';
import { BotComponent } from './components/bot/bot.component';

@NgModule({
  declarations: [
    AppComponent,
    ImportCsvComponent,
    BotComponent
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
    StoreModule.provideStore({
      uploadState,
      response
    }),
    StoreDevtoolsModule.instrumentOnlyWithExtension({
      maxAge: 5
    })
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
