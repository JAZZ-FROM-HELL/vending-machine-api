import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coin } from './user/coin.enum';
import { UserService } from './user/user.service';
import { User } from './user/user';
import { ProductService } from './product/product.service';
import { Product } from './product/product';
import { Change } from './user/change';
import { TransactionService } from './transactions/transaction.service';
import { Transaction } from './transactions/transaction';
import { StatsDto } from './user/stats.dto';

@Injectable()
export class AppService {

  public static readonly INSUFFICIENT_BALANCE_ERROR:ForbiddenException =
    new ForbiddenException('Insufficient balance');

  public static readonly INSUFFICIENT_PRODUCT_UNITS_ERROR:NotFoundException =
    new NotFoundException('Insufficient product units');

  public static readonly NO_EXACT_CHANGE_ERROR:NotFoundException =
    new NotFoundException('Can not return exact change');

  constructor(
    @Inject(UserService) private readonly userService:UserService,
    @Inject(ProductService) private readonly productService:ProductService,
    @Inject(TransactionService) private readonly txService:TransactionService,
  ) {}

  getHello(): string {
    return 'Hello vending machine!';
  }

  async deposit(username:string, coin:Coin|string, amount:number) {
    if (amount <= 0) throw new BadRequestException('Amount must be a positive integer');
    const user:User = await this.userService.findOne(username); // no need to validate user since the guards are already doing so
    user.deposit[coin] += amount;
    return this.userService.update(user);
  }

  async buy(username:string, productName:string, units:number):Promise<StatsDto> {
    if (units <= 0) throw new BadRequestException('Product units must be a positive integer');

    let user:User;
    let product:Product;
    [user, product] = await Promise.all([
      this.userService.findOne(username) ,
      this.productService.findOne(productName),
    ]);

    if (!product) throw ProductService.INVALID_PRODUCT_ERROR;

    // finding out if there are enough available units of the requested product
    if (product.amountAvailable < units) throw AppService.INSUFFICIENT_PRODUCT_UNITS_ERROR;

    const totalCost = product.cost * units;
    const coinKeys:string[] = Object.keys(user.deposit).filter(coin => isNaN(Number(coin)));
    const spending:Change = new Change();
    let remainingTotalChange:number = totalCost;
    let totalBalance = 0; // also finding out if there's enough balance to pay for all that...

    // returning change by priority from greatest coin to smallest
    for (let i = coinKeys.length - 1; i >= 0; i--) {
      const coinValue:number = Coin[coinKeys[i]];
      let coinAmount:number = user.deposit[coinKeys[i]];
      totalBalance += coinValue * coinAmount;

      while (remainingTotalChange > 0 && coinAmount > 0) {
        if (remainingTotalChange - coinValue >= 0) {
          spending[coinKeys[i]]++;
          remainingTotalChange -= coinValue;
          coinAmount--;
        }
        else break;
      }
    }

    if (totalBalance < totalCost) throw AppService.INSUFFICIENT_BALANCE_ERROR;

    if (remainingTotalChange > 0) throw AppService.NO_EXACT_CHANGE_ERROR;


    const tx:Transaction = { user: user, product: product, units: units, totalSpent: totalCost };
    product.amountAvailable -= 1;
    for (const key of coinKeys) {
      user.deposit[key] -= spending[key];
    }

    // this would be created in a transactional scope with a real database
    await Promise.all([
        this.txService.create(tx), // persist transaction
        this.productService.update(product), // persist the product with new unit amount
        this.userService.update(user), // persist new user deposit
    ]);

    const userTxs = await this.txService.findByUser(user);
    const totalSpent = userTxs.reduce((sum, tx) => sum + tx.totalSpent, 0);
    const productsPurchased = userTxs.map(tx => tx.product.productName)
      .filter((value, index, self) => self.indexOf(value) === index); // unique product names

    const stats:StatsDto = {
      username: user.username,
      productsPurchased: productsPurchased,
      totalSpent: totalSpent,
      change: user.deposit,
    }

    return stats;
  }

  async reset(username:string) {
    const user:User = await this.userService.findOne(username);
    user.deposit = new Change();
    await this.userService.update(user);
  }

}
