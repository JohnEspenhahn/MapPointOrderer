import { Component, OnInit, ViewChild, ElementRef, ContentChildren, ViewChildren, QueryList } from '@angular/core';
import { RowsortedComponent } from "./rowsorted/rowsorted.component";
import { GoogleMapsAPIWrapper } from 'angular2-google-maps/core';
import { RouteItemExtra } from "./models/RouteItemExtra";
import { EndpointsService } from "./endpoints.service";
import { SorterService } from "./sorter.service";
import { RightOrLeft } from "./models/RightOrLeft";
import { RouteItem } from "./models/RouteItem";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  markers = [];

  @ViewChild('toppanel') toppanel: ElementRef;
  @ViewChildren(RowsortedComponent) sortedRows: QueryList<RowsortedComponent>;

  promptStreet: string;
  streetOnThe: RightOrLeft;

  activeRoute: string;

  lat: number;
  lng: number;

  constructor(private endpoints: EndpointsService, private sorter: SorterService, private api: GoogleMapsAPIWrapper) { }

  ngOnInit() {
    var routeID = prompt("What route would you like to work on?", "NOGA1200");
    this.load(routeID);
  }

  load(routeID: string) {
    this.markers  = [];
    this.promptStreet = null;
    this.activeRoute = routeID;
    this.streetOnThe = "";
    
    this.sorter.reset();
    this.endpoints.getRoute(routeID).then((items) => {
      for (let item of items) {
        var ie = new RouteItemExtra(item);
        if (item.iLineInTheSand === 1) {
          // Flipped so newly sorted items show at top of list
          this.sorter.sort(ie); 
        } else if (item.iSortOrder === 0) {
          this.sorter.unsort(ie);
        } else {
          this.sorter.sort(ie);
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
      this.sorter.setLoaded();
    });
  }

  save() {
    this.sorter.setUnsaved(false);

    var items: RouteItem[] = [];

    // Add sorted
    this.sorter.forEach((item: RouteItemExtra, sorted: boolean) => {
      if (item.iLineInTheSand === 1) return; // Don't allow updating "LineInTheSand" item
      else if (!sorted && item.iDirectionID < 0) return; // Don't save new, unsorted items to db

      item.iDeleted = 0;
      items.push(item);
    });

    // Add items to be deleted
    this.sorter.executeDelete((item: RouteItemExtra) => {
      // If not in db don't need to delete
      if (item.iDirectionID < 0) return;

      item.iSortOrder = 0;
      item.iDeleted = 1;
      items.push(item);
    });

    this.endpoints.putRouteItems(this.activeRoute, items)
                    .catch(() => this.sorter.setUnsaved(true));
  }

  unsort(item: RouteItemExtra) {
    item.sSideofStreet = "";
    this.sorter.unsort(item);
  }

  sort(item: RouteItemExtra) {
    // this.toppanel.nativeElement.scrollTop = 0;
    item.sSideofStreet = this.streetOnThe;
    this.streetOnThe = "";

    this.sorter.sort(item);
  }

  isUnsaved() {
    return this.sorter.isUnsaved();
  }

  /// Click an unsorted item from the side list
  onClickedUnsorted(item: RouteItemExtra) {
    if (item.isPoint()) {
      // TODO doesn't work for some reason???
      this.api.panTo({ lat: item.address_lat, lng: item.address_lng });
    }
  }

  /// Add a street direction to the sorted list from the prompt
  addStreet(prefix: string, hideStreet: boolean = false) {
    this.sort(new RouteItemExtra({
      iDeleted: 0,
      iDirectionID: -1,
      sDirection: prefix + (hideStreet ? '' : ` ${this.promptStreet}`),
      sSideofStreet: ''
    }));
    this.closePromptStreet();
  }

  addStreetCustom() {
    var direction = prompt("Enter your custom direction");
    if (direction && direction.length > 0) {
      this.addStreet(direction, true);
    }
  }

  /// Clicked on a marker
  clickedMarker(item: RouteItemExtra) {
    if (item.isUnsorted()) {
      this.sort(item);
    } else {
      var rows = this.sortedRows.filter(r => r.item.iSortOrder == item.iSortOrder);
      if (rows.length > 0) 
        this.toppanel.nativeElement.scrollTop = rows[0].el.nativeElement.offsetTop;
    }
  }

  /// Click on the map, open street directions prompt
  onMapClick(event) {
    if (!event.coords) return;

    this.endpoints.geocode(event.coords.lat, event.coords.lng).then((street) => {
      this.promptStreet = street;
    });
  }

  /// Close the prompt for street directions
  closePromptStreet() {
    this.promptStreet = null;
    this.streetOnThe = "";
  }

  loadLocal(routeID) {
    // TODO
  }
}
