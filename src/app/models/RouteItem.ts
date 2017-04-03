import { RightOrLeft } from "./RightOrLeft";

export abstract class RouteItem {
  sRouteID_Combo?: string;
  iSortOrder?: number;
  sDirection?: string;
  iDirectionID: number;
  iLineInTheSand?: number;
  iDeleted: number;
  sHseNum?: string;
  sStreet?: string;
  address_lat?: number;
  address_lng?: number;
  iGeocodeID?: number;
  sSideofStreet: RightOrLeft;
}