import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { newProduct, existingProduct } from './product.mock';
import { Product } from './product';
import { MethodNotAllowedException } from '@nestjs/common';

describe('Product Service', () => {

  let service: ProductService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  beforeEach(async () => {
    await service.clean().then(() => service.create(existingProduct));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new product', () => {
    expect(service.create(newProduct))
      .resolves.toMatchObject(newProduct); // could be different in an actual repo persistence
  });

  it('should reject creating an empty productName', () => {
    expect(service.create({...newProduct, productName: ''}))
      .rejects.toThrow(ProductService.INVALID_PRODUCT_ERROR);
  });

  it('should reject creating an existing product', () => {
    expect(service.create(existingProduct)).rejects
      .toThrow(ProductService.ALREADY_EXISTS_ERROR);
  });

  it('should reject creating a product with a price not multiple of 5', () => {
    expect(service.create({...newProduct, cost: 19}))
      .rejects.toThrow(ProductService.INVALID_PRODUCT_ERROR);
  })

    it('should reject updating to an empty productName', () => {
    expect(service.update({...existingProduct, productName: ''}))
      .rejects.toThrow(ProductService.INVALID_PRODUCT_ERROR);
  });

  it('should reject updating a non-existing product', () => {
    expect(service.update(newProduct))
      .rejects.toThrow(ProductService.NOT_EXIST_ERROR);
  });


  it('should update an existing product', async () => {
    const updatedProduct:Product = {...existingProduct, cost: 560, amountAvailable: 24};
    await service.update(updatedProduct);
    await expect(service.findOne(updatedProduct.productName))
      .resolves.toMatchObject(updatedProduct);
  });

  it('should reject deleting a non-existing product', () => {
    expect(service.delete(newProduct.productName))
      .rejects.toThrow(ProductService.NOT_EXIST_ERROR);
  });

  it('should delete an existing product', async () => {
    await service.delete(existingProduct.productName);
    await expect(service.findOne(existingProduct.productName))
      .resolves.toBeUndefined();
  });

  it('should not support find all', () => {
    expect(service.findAll()).rejects.toThrow(MethodNotAllowedException);
  })

});
