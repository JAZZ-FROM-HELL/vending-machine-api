import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { buyerTx1, buyerTx2, buyerTx3, otherBuyerTx1 } from './transaction.mock';
import { MethodNotAllowedException } from '@nestjs/common';
import { buyerUser } from '../user/user.mock';

describe('Transaction Service', () => {

  let service: TransactionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionService],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  beforeEach(async () => {
    await service.clean();
    await Promise.all([
      service.create(buyerTx1),
      service.create(otherBuyerTx1),
    ]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should read a single transaction', () => {
    expect(service.findOne(buyerTx1.id)).resolves.toEqual(buyerTx1);
  });

  it('should read all transactions', () => {
    expect(service.findAll()).resolves.toEqual([buyerTx1, otherBuyerTx1]);
  });

  it('should create a transaction with incremented id', () => {
    expect(service.create(buyerTx2))
      .resolves.toMatchObject({...buyerTx2, id: 3})
  });

  it('should find all transactions by user', () => {
    // one buyer and one other buyer transaction are already in
    Promise.all([
      service.create(buyerTx2),
      service.create(buyerTx3)
    ]);
    expect(service.findByUser(buyerUser))
      .resolves.toEqual([buyerTx1, buyerTx2, buyerTx3]);
  });

  it('should reject updates', () => {
    expect(service.update(buyerTx1)).rejects.toThrow(MethodNotAllowedException);
  });

  it('should reject deletes', () => {
    expect(service.delete(buyerTx1.id)).rejects.toThrow(MethodNotAllowedException);
  });

});