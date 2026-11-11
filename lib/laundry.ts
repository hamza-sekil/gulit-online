// Laundry service items (catalogue ids 300000–300999). Each laundry partner sets its own price per item type
// in the storekeeper app; customers pick a laundry and see that laundry's prices.
// Unlike shop goods, laundry is a service: the stock number only says whether the laundry is accepting orders
// (any quantity above zero), it is never used up, and the delivery fee covers two trips (pickup and return).
export const LAUNDRY_FROM = 300000, LAUNDRY_TO = 300999;
export const isLaundry = (id: number) => Number.isInteger(id) && id >= LAUNDRY_FROM && id <= LAUNDRY_TO;
export const LAUNDRY_TRIPS = 2;
export const LAUNDRY_TYPE = 'Laundry / dry cleaner';
