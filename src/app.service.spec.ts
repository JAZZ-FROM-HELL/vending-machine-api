import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user/user.service';
import { buyerUser } from './user/user.mock';
import { existingProduct, newProduct } from './product/product.mock';
import { AppService } from './app.service';
import { User } from './user/user';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductService } from './product/product.service';
import { TransactionService } from './transactions/transaction.service';
import { StatsDto } from './user/stats.dto';
import { Change } from './user/change';
import { buyerTx1, buyerTx2, buyerTx3, otherBuyerTx1 } from './transactions/transaction.mock';


describe('App Service', () => {

  let appService: AppService;
  let userService: UserService;
  let productService: ProductService;
  let txService: TransactionService;
  let getUser;

  beforeAll( async() => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, UserService, ProductService, TransactionService],
    }).compile();

    appService = module.get<AppService>(AppService);
    userService = module.get<UserService>(UserService);
    productService = module.get<ProductService>(ProductService);
    txService = module.get<TransactionService>(TransactionService);

    getUser = async (user:User) => await userService.findOne(user.username);
  });

  beforeEach(async () => {

    // reset values
    buyerUser.deposit = new Change();
    existingProduct.amountAvailable = 5;
    newProduct.amountAvailable = 15;

    await Promise.all([
      userService.clean().then(() => userService.create(buyerUser)),
      productService.clean().then(() => productService.create(existingProduct)),
      txService.clean()
    ]);
  });

  it('should be defined', () => {
    expect(appService).toBeDefined();
  });

  it('should deposit 1 of 5 cent, current 0', async () => {
    await appService.deposit(buyerUser.username, 'cent5' , 1);
    const expectedUser = await getUser(buyerUser);
    expect(expectedUser.deposit).toMatchObject({...buyerUser.deposit, cent5: 1});
  });

  it('should deposit 2 of 10 cent, cent 10 is 3, cent 50 is 5', async () => {
    buyerUser.deposit.cent10 = 3;
    buyerUser.deposit.cent50 = 5;
    await appService.deposit(buyerUser.username, 'cent10', 2);
    const expectedUser = await getUser(buyerUser);
    expect(expectedUser.deposit).toMatchObject({...buyerUser.deposit, cent10: 5});
  });

  it('should deposit 10 of 20 cent, cent 20 is 40, cent 100 is 25', async () => {
    buyerUser.deposit.cent20 = 40;
    buyerUser.deposit.cent100 = 25;
    await appService.deposit(buyerUser.username, 'cent20', 10);
    const expectedUser = await getUser(buyerUser);
    expect(expectedUser.deposit).toMatchObject({...buyerUser.deposit, cent20: 50});
  });

  it('should reject negative integers', async () => {
    await expect(appService.deposit(buyerUser.username, 'cent100', -12))
      .rejects.toThrow(BadRequestException);
  });

  it('should reject zero', async () => {
    await expect(appService.deposit(buyerUser.username, 'cent5', 0))
      .rejects.toThrow(BadRequestException);
  });


  // Buy

  it('should buy a single product with one coin type', async () => {
    const stats:StatsDto = {
      username: buyerUser.username,
      totalSpent: 125,
      productsPurchased:[existingProduct.productName],
      change: {...new Change(), cent5: 1},
    }
    await userService.update({... buyerUser, deposit: {...buyerUser.deposit, cent5: 26}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 1)) // total 125
      .resolves.toMatchObject(stats);
  });

  it('should buy two product units with two coin types', async () => {
    const stats:StatsDto = {
      username: buyerUser.username,
      totalSpent: 250,
      productsPurchased:[existingProduct.productName],
      change: {...new Change(), cent10: 7},
    }
    await userService.update(
      {... buyerUser, deposit: {...buyerUser.deposit, cent10: 12, cent100: 2}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 2)) // total 250
      .resolves.toMatchObject(stats);
  });

  it('should buy a single product with multiple coin types', async () => {
    const stats:StatsDto = {
      username: buyerUser.username,
      totalSpent: 375,
      productsPurchased:[existingProduct.productName],
      change: { cent5: 4, cent10: 3, cent20: 2, cent50: 0, cent100: 0},
    }
    await userService.update(
      {... buyerUser, deposit: { cent5: 5, cent10: 4, cent20: 5, cent50: 2, cent100: 2}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 3)) // total 375
      .resolves.toMatchObject(stats);
  });

  it('should buy multiple product units with multiple coin types exact change', async () => {
    const stats:StatsDto = {
      username: buyerUser.username,
      totalSpent: 500,
      productsPurchased:[existingProduct.productName],
      change: { cent5: 0, cent10: 0, cent20: 0, cent50: 0, cent100: 0},
    }
    await userService.update(
      {... buyerUser, deposit: { cent5: 2, cent10: 7, cent20: 6, cent50: 4, cent100: 1}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 4)) // total 500
      .resolves.toMatchObject(stats);
  });

  it('should buy exactly all units of product', async () => {
    await userService.update(
      {... buyerUser, deposit: {...buyerUser.deposit, cent5: 200}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 5))
      .resolves; // no exception thrown
  });

  it('buy should persist new user deposit', async () => {
    await userService.update({... buyerUser, deposit: {...buyerUser.deposit, cent5: 26}});

    await expect(await appService.buy(buyerUser.username, existingProduct.productName, 1))
      .resolves; // no exception thrown

    const newUserDeposit =
      {...(await userService.findOne(buyerUser.username)).deposit};
    expect(newUserDeposit).toEqual({ ...new Change(), cent5: 1 });
  });

  it('buy should persist new product units amount', async () => {
    const purchasedUnits = 1;
    const originalProductUnits =
      (await productService.findOne(existingProduct.productName)).amountAvailable;
    await userService.update({... buyerUser, deposit: {...buyerUser.deposit, cent5: 26}});

    await expect(await appService.buy(buyerUser.username, existingProduct.productName, purchasedUnits))
      .resolves; // no exception thrown

    const newProductUnits =
      (await productService.findOne(existingProduct.productName)).amountAvailable;
    expect(newProductUnits).toEqual(originalProductUnits - purchasedUnits);
  });

  it('should reject when buyer has insufficient balance', async () => {
    await userService.update(
      {... buyerUser, deposit: { cent5: 10, cent10: 2, cent20: 1, cent50: 2, cent100: 0}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 2))
      .rejects.toThrow(ForbiddenException);
  });


  it('should reject when insufficient product units', async () => {
    await userService.update(
      {... buyerUser, deposit: {...buyerUser.deposit, cent100: 10}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 6))
      .rejects.toThrow(NotFoundException);
  });

  it('should reject when not having exact change', async () => {
    await userService.update(
      {... buyerUser, deposit: { cent5: 0, cent10: 2, cent20: 1, cent50: 2, cent100: 1}});

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 1))
      .rejects.toThrow(NotFoundException); // product price is 125, no change of 5s
  });

  it('should return all puchased products and history total spending', async () => {
    const stats:StatsDto = {
      username: buyerUser.username,
      totalSpent: buyerTx1.totalSpent + buyerTx2.totalSpent + buyerTx3.totalSpent + 250,
      productsPurchased:[existingProduct.productName, newProduct.productName],
      change: {...new Change(), cent5: 1},
    }
    await Promise.all([
      productService.create(newProduct).then(() => {
        txService.create(buyerTx1);
        txService.create(buyerTx2);
        txService.create(otherBuyerTx1);
        txService.create(buyerTx3);
      }),
      userService.update({... buyerUser, deposit: {...buyerUser.deposit, cent20: 2, cent5: 43}})
    ]);

    await expect(appService.buy(buyerUser.username, existingProduct.productName, 2)) // total 250
      .resolves.toMatchObject(stats);
  });


  // Reset

  it('should reset buyer deposit', async () => {
    // persisting a non-zero deposit
    await userService.update(
      {... buyerUser, deposit: {...buyerUser.deposit, cent10: 1, cent5: 26}});

    await expect(await appService.reset(buyerUser.username)).resolves; // no exception thrown

    // making sure it was persisted
    const newUserDeposit = {...(await userService.findOne(buyerUser.username)).deposit};

    expect(newUserDeposit).toEqual(new Change());
  });


});