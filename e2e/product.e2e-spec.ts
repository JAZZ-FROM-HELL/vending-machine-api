import * as request from 'supertest';
import {Test} from '@nestjs/testing';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {AppModule} from './../src/app.module';
import {ProductService} from '../src/product/product.service';
import {newProduct, existingProduct} from '../src/product/product.mock';
import {Product} from '../src/product/product';
import { User } from '../src/user/user';
import { buyerUser, sellerUser } from '../src/user/user.mock';
import { UserService } from '../src/user/user.service';



describe('Product', () => {
  let app: INestApplication;
  let userRepo: UserService;
  let productRepo: ProductService;

  let getRequest;
  let postRequest;
  let putRequest;
  let deleteRequest;

  beforeAll(async () => {
     const moduleRef = await Test.createTestingModule({
         imports: [AppModule],
     }).compile();

     app = moduleRef.createNestApplication();
     userRepo = moduleRef.get<UserService>(UserService);
     productRepo = moduleRef.get<ProductService>(ProductService);

     await app.init();

     getRequest = (product:Product) => {
       return request(app.getHttpServer())
         .get('/product/' + product.productName)
     };

     postRequest = (user:User) => {
       return request(app.getHttpServer())
         .post('/product')
         .set('Content-Type', 'application/json')
         .set('Accept', 'application/json')
         .query({username: user.username, password: user.password});
     };

     putRequest = (product:Product, user:User) => {
        return request(app.getHttpServer())
          .put('/product/' + product.productName)
          .set('Content-Type', 'application/json')
          .query({username: user.username, password: user.password});
     };

     deleteRequest = (product:Product, user:User) => {
       return request(app.getHttpServer())
         .delete('/product/' + product.productName)
         .query({username: user.username, password: user.password});
     }

  });

  // init repository
  beforeEach(async () => {
    await Promise.all([
      userRepo.clean().then(() => userRepo.create(sellerUser)),
      productRepo.clean().then(() => productRepo.create(existingProduct)),
    ]);
  });


  // GET

  it('GET /product', () => {
    return getRequest(existingProduct)
      .expect(HttpStatus.OK)
      .expect(existingProduct);
  });

  it('GET /product not exists', () => {
    return getRequest(newProduct)
      .expect(HttpStatus.NOT_FOUND);
  });

  // POST - requires Seller role

  it('POST /product (seller)', () => {
    return postRequest(sellerUser)
      .send(newProduct)
      .expect(HttpStatus.CREATED)
      .expect(newProduct);
  });

  it('POST /product unauthorized (not seller)', () => {
    return postRequest(buyerUser)
      .send({...newProduct, sellerId: buyerUser.username})
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('POST /product unauthorized (seller, not owner)', () => {
    return postRequest(sellerUser)
      .send({...newProduct, sellerId: 'notOwner'})
      .expect(HttpStatus.FORBIDDEN);
  });

  it('POST /product already exists', () => {
    return postRequest(sellerUser)
      .send(existingProduct)
      .expect(HttpStatus.CONFLICT);
  });

  it('POST /product empty productName', () => {
    return postRequest(sellerUser)
      .send({...existingProduct, productName: '' })
      .expect(HttpStatus.BAD_REQUEST);
  });


  // PUT - requires Seller role

  it('PUT /product (seller, own product)', () => {
    const updateProduct:Product = { ...existingProduct, cost: 950, amountAvailable: 30 };
    return putRequest(updateProduct, sellerUser)
      .send(updateProduct)
      .expect(HttpStatus.OK);
  });

  it('PUT /product unauthorized (not seller)', () => {
    const updateProduct:Product = { ...existingProduct, sellerId: buyerUser.username };
    return putRequest(updateProduct, buyerUser)
      .send(updateProduct)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('PUT /product unauthorized (seller, not owner)', () => {
    const updateProduct:Product = { ...existingProduct, sellerId: 'notOwner' };
    return putRequest(updateProduct, sellerUser)
      .send(updateProduct)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('PUT /product not exist', () => {
    return putRequest(newProduct, sellerUser)
      .send(newProduct)
      .expect(HttpStatus.NOT_FOUND);
  });


  // DELETE - requires Seller role

  it('/DELETE product (seller, own product)', () => {
    return deleteRequest(existingProduct, sellerUser)
      expect(HttpStatus.OK);
  });

  it('DELETE /product unauthorized (not seller)', () => {
    return deleteRequest(existingProduct, buyerUser)
      expect(HttpStatus.UNAUTHORIZED);
  });

  it('DELETE /product unauthorized (seller, not owner)',  () => {
    const deleteProduct = {...existingProduct, sellerId: 'notOwner'};
    return deleteRequest(deleteProduct, sellerUser)
      expect(HttpStatus.FORBIDDEN);
  });

  it('DELETE /product not exist',  () => {
    return deleteRequest(newProduct, sellerUser)
      expect(HttpStatus.NOT_FOUND);
  });


  // after

  afterAll(async () => {
      await app.close();
  });

});
