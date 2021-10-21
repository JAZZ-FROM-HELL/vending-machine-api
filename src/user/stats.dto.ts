// DTO for user stats and purchase history

import { Change } from './change';

export class StatsDto {
  username:string;
  totalSpent:number;
  productsPurchased:string[];
  change:Change;
}