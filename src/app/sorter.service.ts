import { Injectable } from '@angular/core';
import { RouteItemExtra } from './models/RouteItemExtra';

@Injectable()
export class SorterService {
  private loading: boolean;
  private unsaved: boolean;
  private sorted: RouteItemExtra[];
  private unsorted: RouteItemExtra[];
  private toDelete: RouteItemExtra[];

  constructor() { 
    this.sorted = [];
    this.unsorted = [];
    this.toDelete = [];
    this.unsaved = false;
    this.loading = true;
  }

  reset() {
    this.sorted.length = 0;
    this.unsorted.length = 0;
    this.toDelete.length = 0;
    this.unsaved = false;
    this.loading = true;
  }

  setLoaded() {
    this.loading = false;
  }

  isUnsaved() {
    return !this.loading && this.unsaved;
  }

  setUnsaved(uns: boolean) {
    this.unsaved = uns;
  }

  /// Move item to the unsorted list
  unsort(item: RouteItemExtra) {
    this.flagItem(item);
    item.iSortOrder = 0;
    
    let idx = this.sorted.indexOf(item);
    if (idx >= 0) this.sorted.splice(idx, 1);

    // If already existing in the database, move to different list
    if (item.iDirectionID >= 0) {
      if (!item.sDirection) {
        // Not a driving direction, so move
        this.unsorted.unshift(item);
      } else {
        // Was a preexisting driving direction, flag to delete
        item.iDeleted = 1;
        this.toDelete.unshift(item);
      }
    }

    // Update following items order
    if (idx >= 0)
      for (let i = idx+1, ii = this.sorted.length; i <= ii; i++)
        this.sorted[ii-i].iSortOrder = i;
  }

  /// Move an item to the sorted list
  sort(item: RouteItemExtra) {
    this.flagItem(item);

    let idx = this.unsorted.indexOf(item);
    if (idx >= 0) this.unsorted.splice(idx, 1);

    item.iSortOrder = this.sorted.length+1;
    this.sorted.unshift(item);
  }

  /// Returns all not deleted item
  forEach(callback: (item: RouteItemExtra, sorted: boolean) => void) {
    for (let i = 1, ii = this.sorted.length; i <= ii; i++) {
      let item = this.sorted[ii-i]; // Unflip the list
      callback(item, true);
    }

    for (let item of this.unsorted) {
      callback(item, false);
    }
  }

  executeDelete(callback: (item: RouteItemExtra) => void) {
    for (let item of this.toDelete) {
      callback(item);
    }
    this.toDelete.length = 0;
  }

  /// Temporarially highlight an item
  flagItem(item: RouteItemExtra) {
    if (this.loading) return;

    this.unsaved = true;
    item.flagged = true;
    if (item.flaggedTimeoutId) clearTimeout(item.flaggedTimeoutId);
    item.flaggedTimeoutId = setTimeout(() => item.flagged = false, 2000);
  }

}
