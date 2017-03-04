import { Component, OnInit } from '@angular/core';
import { EndpointsService, RouteItem } from "./endpoints.service";
import { GoogleMapsAPIWrapper } from 'angular2-google-maps/core';

class RouteItemExtra extends RouteItem {
  flagged: boolean;

  constructor(item: RouteItem) {
    super();

    this.address_lat = item.address_lat;
    this.address_lng = item.address_lng;
    this.iGeocodeID = item.iGeocodeID;
    this.iLineInTheSand = item.iLineInTheSand;
    this.iSortOrder = item.iSortOrder;
    this.sDirection = item.sDirection;
    this.sHseNum = item.sHseNum;
    this.sRouteID_Combo = item.sRouteID_Combo;
    this.sStreet = item.sStreet;

    this.flagged = false;
  }

  isPoint(): boolean {
    return (!!this.address_lng && !!this.address_lat);
  }

  isUnsorted(): boolean {
    return this.iSortOrder === 0;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  unsaved: boolean;

  sorted: RouteItemExtra[] = [];
  unsorted: RouteItemExtra[] = [];
  markers = [];

  promptStreet: string;
  activeRoute: string;

  lat: number;
  lng: number;

  constructor(private endpoints: EndpointsService, private api: GoogleMapsAPIWrapper) { }

  ngOnInit() {
    this.load(prompt("What route would you like to work on?", "NOGA1200"));
  }

  load(routeID: string) {
    this.sorted = [];
    this.unsorted = [];
    this.markers  = [];
    this.unsaved = true;
    this.promptStreet = null;
    this.activeRoute = routeID;
    
    this.endpoints.getRoute(routeID).then((items) => {
      for (let item of items) {
        var ie = new RouteItemExtra(item);
        if (item.iLineInTheSand === 1)
          this.sorted.unshift(ie);
        else if (item.iSortOrder === 0) {
          this.unsorted.push(ie);
        } else {
          this.sorted.unshift(ie);
        }

        // Jump to first point found
        if (ie.isPoint()) {
          this.markers.push(ie);

          if (!this.lat && !this.lng) {
            this.lat = ie.address_lat;
            this.lng = ie.address_lng;
          }
        }
      }
    });
  }

  flagItem(item: RouteItemExtra) {
    item.flagged = true;
    setTimeout(() => item.flagged = false, 2000);
  }

  onClickedUnsorted(item: RouteItemExtra) {
    if (item.isPoint()) {
      this.api.panTo({ lat: item.address_lat, lng: item.address_lng });
    }
  }

  unsort(item: RouteItemExtra) {
    this.flagItem(item);

    this.sorted.splice(this.sorted.indexOf(item), 1);
    this.unsorted.unshift(item);

    item.iSortOrder = 0;
  }

  sort(item: RouteItemExtra) {
    this.flagItem(item);

    item.iSortOrder = this.sorted.length;
    this.unsorted.splice(this.unsorted.indexOf(item), 1);
    this.sorted.unshift(item);

    localStorage.setItem("sorted-" + this.activeRoute, JSON.stringify(this.sorted));
  }

  clickedMarker(item: RouteItemExtra) {
    if (item.isUnsorted()) {
      this.sort(item);
    } else {
      this.unsort(item);
    }
  }

  onMapClick(event) {
    if (event.coords)
      this.endpoints.geocode(event.coords.lat, event.coords.lng).then((street) => {
        console.log(street);
        this.promptStreet = street;
      });
  }

  cancelPromptStreet() {
    this.promptStreet = null;
  }
}
