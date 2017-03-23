import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

export abstract class RouteItem {
  sRouteID_Combo?: string;
  iSortOrder: number;
  sDirection?: string;
  iDirectionID: number;
  iLineInTheSand?: number;
  iDeleted: number;
  sHseNum?: string;
  sStreet?: string;
  address_lat?: number;
  address_lng?: number;
  iGeocodeID?: number;
}

@Injectable()
export class EndpointsService {
  private key = 'AIzaSyBDMKUIpFoohScPnujC4VQCHTPJQAQMk1s';

  constructor(private http: Http) { }

  getRoute(sRouteID_Combo: string): Promise<RouteItem[]> {
    return this.http.get(`php/Endpoints.php/route/${sRouteID_Combo}`)
              .toPromise().then(res => res.json() as RouteItem[]);
  }

  putRouteItems(sRouteID_Combo: string, items: RouteItem[]): Promise<any> {
    return this.http.put(`php/Endpoints.php/route/${sRouteID_Combo}`, items)
              .toPromise().catch((err) => alert("Failed to save! " + err));
  }

  geocode(lat: number, lng: number): Promise<string> {
    let base = "https://maps.googleapis.com/maps/api/geocode/json";
    return this.http.get(`${base}?latlng=${lat},${lng}&key=${this.key}`)
              .toPromise().then(res => {
                for (let r of res.json().results)
                  for (let a of r.address_components)
                    if (a.types.indexOf('route') >= 0)
                      return a.long_name;
                return null;
              });
  }

}
