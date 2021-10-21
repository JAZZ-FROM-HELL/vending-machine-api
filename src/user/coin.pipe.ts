import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Coin } from './coin.enum';

@Injectable()
export class CoinPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const coin:Coin = Coin[Coin[value]];
    if (!coin) throw new BadRequestException('Bad coin type');
    return coin;
  }
}