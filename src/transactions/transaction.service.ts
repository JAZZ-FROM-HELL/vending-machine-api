import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { CrudService } from '../common/crud.service';
import { Transaction } from './transaction';
import { User } from '../user/user';

@Injectable()
export class TransactionService extends CrudService<Transaction, number> {

  protected key(tx:Transaction):number {
    return tx.id;
  }

  async create(tx:Transaction) {
    tx.id = this.repo.length + 1; // auto-increment
    return super.create(tx);
  }

  async findByUser(user:User):Promise<Transaction[]> {
    return this.repo.filter(tx => tx.user.username === user.username);
  }

  async update(tx:Transaction) {
    throw new MethodNotAllowedException('Updating transactions is not supported');
  }

  async delete(txid:number) {
    throw new MethodNotAllowedException('Deleting transactions is not supported');
  }

}