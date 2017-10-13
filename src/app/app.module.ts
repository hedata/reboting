import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { DataService } from './services/data.service';

import { AppComponent } from './app.component';
import { BotComponent } from './components/bot/bot.component';
import {VisualComponent} from './components/visual/visual.component';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import {OpenDataComponent} from './components/opendatasearchresults/opendata.component';
import {SplashComponent} from './components/splash/splash.component';
import {AuthService} from './services/auth.service';
import {IntentComponent} from './components/intent/intent.component'
import {BotContextService} from "./services/botcontext.service";

@NgModule({
  declarations: [
    AppComponent,
    BotComponent,
    VisualComponent,
    OpenDataComponent,
    SplashComponent,
    IntentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ButtonsModule.forRoot()
  ],
  providers: [
    DataService,
    AuthService,
    BotContextService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
