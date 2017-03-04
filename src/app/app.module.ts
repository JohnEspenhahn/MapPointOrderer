import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AgmCoreModule, GoogleMapsAPIWrapper } from 'angular2-google-maps/core';

import { AppComponent } from './app.component';
import { EndpointsService } from './endpoints.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBDMKUIpFoohScPnujC4VQCHTPJQAQMk1s'
    })
  ],
  providers: [
    EndpointsService,
    GoogleMapsAPIWrapper
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
