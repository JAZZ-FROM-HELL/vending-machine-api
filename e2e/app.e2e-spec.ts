import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { buyerUser, sellerUser } from '../src/user/user.mock';
import { User } from '../src/user/user';
import { Coin } from '../src/user/coin.enum';
import { UserService } from '../src/user/user.service';
import { ProductService } from '../src/product/product.service';
import { Product } from '../src/product/product';
import { existingProduct, newProduct } from '../src/product/product.mock';
import { StatsDto } from '../src/user/stats.dto';
import { buyerTx1, buyerTx2, buyerTx3, otherBuyerTx1 } from '../src/transactions/transaction.mock';
import { Change } from '../src/user/change';
import { TransactionService } from '../src/transactions/transaction.service';

describe('App', () => {
  let app: INestApplication;
  let depositRequest;
  let buyRequest;
  let resetRequest;
  let userRepo: UserService;
  let productRepo: ProductService;
  let txRepo: TransactionService;


  beforeAll(  async() => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    userRepo = moduleRef.get<UserService>(UserService);
    productRepo = moduleRef.get<ProductService>(ProductService);
    txRepo = moduleRef.get<TransactionService>(TransactionService);

    await app.init();

    depositRequest = (user:User, coin:Coin, amount:number) => {
      return request(app.getHttpServer())
        .put('/deposit')
        .set('Content-Type', 'application/json')
        .query({
          username: user.username,
          password: user.password,
          coin: coin,
          amount: amount
        });
    };

    buyRequest = (user:User, product:Product, units:number) => {
      return request(app.getHttpServer())
        .put('/buy')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .query({
          username: user.username,
          password: user.password,
          productName: product.productName,
          units: units
        });
    };

    resetRequest = (user:User) => {
      return request(app.getHttpServer())
        .put('/reset')
        .set('Content-Type', 'application/json')
        .query({
          username: user.username,
          password: user.password,
        });
    };
  });

  beforeEach(async () => {
    await userRepo.clean().then(() => {
      userRepo.create(buyerUser);
      userRepo.create(sellerUser);
    });
  });

  it('Hello', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK)
      .expect('Hello vending machine!');
  });


  // deposit endpoint

  it('/deposit buyer deposit 50',  () => {
    return depositRequest(buyerUser, Coin.cent50, 10)
      .expect(HttpStatus.OK);
  });

  it('/deposit bad coin rejected',  () => {
    return depositRequest(buyerUser, 'nosuchcoin', 10)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/deposit string amount rejected',  () => {
    return depositRequest(buyerUser, Coin.cent5, 'notanumber')
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/deposit float amount truncated',  () => {
    return depositRequest(buyerUser, Coin.cent10, 1.5)
      .expect(HttpStatus.OK);
  });

  it('/deposit buyer user not exist unauthorized',  () => {
    const noUser = {...buyerUser, username: 'nosuchuser'};
    return depositRequest(noUser, Coin.cent20, 12)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/deposit buyer user wrong password unauthorized',  () => {
    const buyerWrongPassword = {...buyerUser, password: 'wrong'};
    return depositRequest(buyerWrongPassword, Coin.cent50, 14)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/deposit user not buyer forbidden',  () => {
    return depositRequest(sellerUser, Coin.cent100, 14)
      .expect(HttpStatus.FORBIDDEN);
  });


  // Buy
  it('/buy should buy product with purchase history', async () => {
    buyerUser.deposit = new Change();
    const stats:StatsDto = {
      username: buyerUser.username,
      totalSpent: buyerTx1.totalSpent + buyerTx2.totalSpent + buyerTx3.totalSpent + 250,
      productsPurchased:[existingProduct.productName, newProduct.productName],
      change: {...new Change(), cent5: 1},
    }
    await Promise.all([
      productRepo.create(existingProduct),
      productRepo.create(newProduct),
      txRepo.create(buyerTx1),
      txRepo.create(buyerTx2),
      txRepo.create(otherBuyerTx1),
      txRepo.create(buyerTx3)
    ]);
    await userRepo.update({... buyerUser, deposit: {...buyerUser.deposit, cent20: 2, cent5: 43}});

    return buyRequest(buyerUser, existingProduct, 2)
      .expect(HttpStatus.OK)
      .expect(stats);
  });

  it('/buy buyer user not exist unauthorized',  () => {
    const noUser = {...buyerUser, username: 'nosuchuser'};
    return buyRequest(noUser, existingProduct, 3)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/buy buyer user wrong password unauthorized',  () => {
    const buyerWrongPassword = {...buyerUser, password: 'wrong'};
    return buyRequest(buyerWrongPassword, existingProduct, 4)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/buy user not buyer forbidden',  () => {
    return buyRequest(sellerUser, existingProduct, 4)
      .expect(HttpStatus.FORBIDDEN);
  });


  // Reset

  it('/reset should reset user deposit', () => {
    return resetRequest(buyerUser).expect(HttpStatus.OK);
  });

  it('/reset buyer not exist unauthorized', () => {
    const noUser = {...buyerUser, username: 'nosuchuser'};
    return resetRequest(noUser).expect(HttpStatus.UNAUTHORIZED);
  });

  it('/reset buyer wrong password unauthorized', () => {
    const buyerWrongPassword = {...buyerUser, password: 'wrong'};
    return resetRequest(buyerWrongPassword).expect(HttpStatus.UNAUTHORIZED);
  });

  it('/reset user not buyer forbidden', () => {
    return resetRequest(sellerUser).expect(HttpStatus.FORBIDDEN);
  });


  // after

  afterAll(async () => {
    await app.close();
  });

});
