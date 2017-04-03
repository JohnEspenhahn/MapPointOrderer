import { RightOrLeft } from "./RightOrLeft";
import { RouteItem } from "./RouteItem";

export class RouteItemExtra extends RouteItem {
  flagged: boolean;
  flaggedTimeoutId: number;

  constructor(item: RouteItem) {
    super();

    this.address_lat = item.address_lat;
    this.address_lng = item.address_lng;
    this.iGeocodeID = item.iGeocodeID;
    this.iLineInTheSand = item.iLineInTheSand;
    this.iSortOrder = item.iSortOrder;
    this.sDirection = item.sDirection;
    this.iDirectionID = item.iDirectionID;
    this.iDeleted = item.iDeleted;
    this.sHseNum = item.sHseNum;
    this.sRouteID_Combo = item.sRouteID_Combo;
    this.sStreet = item.sStreet;
    this.sSideofStreet = item.sSideofStreet || "";

    this.flagged = false;
  }

  getDisplayText(): string {
    if (this.sDirection)
      return this.sDirection;
    else
      return `${this.sHseNum} ${this.sStreet} ${this.sSideofStreet}`;
  }

  isPoint(): boolean {
    return (!!this.address_lng && !!this.address_lat);
  }

  isUnsorted(): boolean {
    return this.iSortOrder === 0;
  }
}