import { Component, OnInit } from '@angular/core';
import { EndpointsService, RouteItem } from "./endpoints.service";
import { GoogleMapsAPIWrapper } from 'angular2-google-maps/core';
import { RouteItemExtra } from "./models/RouteItemExtra";

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
    var routeID = prompt("What route would you like to work on?", "NOGA1200");
    this.load(routeID);
  }

  load(routeID: string) {
    this.sorted = [];
    this.unsorted = [];
    this.markers  = [];
    this.unsaved = false;
    this.promptStreet = null;
    this.activeRoute = routeID;
    
    this.endpoints.getRoute(routeID).then((items) => {
      for (let item of items) {
        var ie = new RouteItemExtra(item);
        if (item.iLineInTheSand === 1)
          this.sorted.unshift(ie); // Flipped so newly sorted items show at top of list
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

  save() {
    this.unsaved = false;

    var items = [];

    // Add sorted
    for (let i = 1, ii = this.sorted.length; i <= ii; i++) {
      let item = this.sorted[ii-i]; // Unflip the list
      if (item.iLineInTheSand === 1) continue;

      items.push({ 
        sDirection: item.sDirection || '',
        iDirectionID: item.iDirectionID || -1,
        iSortOrder: i
      });
    }

    // Add unsorted, preexisting
    for (let item of this.unsorted) {
      if (!item.iDirectionID) continue;

      items.push({
        iDirectionID: item.iDirectionID,
        iSortOrder: 0
      });
    }

    this.endpoints.putRouteItems(this.activeRoute, items).catch(() => this.unsaved = true);
  }

  /// Temporarially highlight an item
  flagItem(item: RouteItemExtra) {
    this.unsaved = true;
    item.flagged = true;
    setTimeout(() => item.flagged = false, 2000);
  }

  /// Click an unsorted item from the side list
  onClickedUnsorted(item: RouteItemExtra) {
    if (item.isPoint()) {
      this.api.panTo({ lat: item.address_lat, lng: item.address_lng });
    }
  }

  /// Move item to the unsorted list
  unsort(item: RouteItemExtra) {
    this.sorted.splice(this.sorted.indexOf(item), 1);

    // If already existing in the database, move to other list
    if (item.iDirectionID) {
      this.flagItem(item);
      this.unsorted.unshift(item);
      item.iSortOrder = 0;
    }
  }

  /// Move an item to the sorted list
  sort(item: RouteItemExtra) {
    this.flagItem(item);

    item.iSortOrder = this.sorted.length;
    this.unsorted.splice(this.unsorted.indexOf(item), 1);
    this.sorted.unshift(item);

    this.saveLocal();
  }

  /// Clicked on a marker
  clickedMarker(item: RouteItemExtra) {
    if (item.isUnsorted()) {
      this.sort(item);
    } else {
      this.unsort(item);
    }
  }

  /// Click on the map, open street directions prompt
  onMapClick(event) {
    if (!event.coords) return;

    this.endpoints.geocode(event.coords.lat, event.coords.lng).then((street) => {
      this.promptStreet = street;
    });
  }

  /// Add a street direction to the sorted list from the prompt
  addStreet(prefix: string) {
    this.sorted.unshift(new RouteItemExtra({
      sDirection: `${prefix} ${this.promptStreet}`
    }));
    this.closePromptStreet();
  }

  /// Close the prompt for street directions
  closePromptStreet() {
    this.promptStreet = null;
  }

  /// Save modified values to local storage
  saveLocal() {
    localStorage.setItem("unsorted-" + this.activeRoute, JSON.stringify(this.unsorted));
    localStorage.setItem("sorted-" + this.activeRoute, JSON.stringify(this.sorted));
  }

  loadLocal(routeID) {
    // TODO
  }
}
