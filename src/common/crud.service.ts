import { Entity } from './entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

export abstract class CrudService<T extends Entity<K>, K> {

  protected readonly repo:T[] = [];

  public static readonly ALREADY_EXISTS_ERROR:ConflictException =
    new ConflictException('Already exists');
  public static readonly NOT_EXIST_ERROR:NotFoundException =
    new NotFoundException('Does not exist');

  async clean() {
    this.repo.splice(0, this.repo.length);
  }

  async findAll():Promise<T[]> {
    return this.repo;
  }

  async findOne(key: K): Promise<T | undefined> {
    return this.repo.find(entity => this.key(entity) === key);
  }

  async create(entity:T):Promise<T> {
    await this.validate(entity, false);
    this.repo.push(entity);
    return this.findOne(this.key(entity)); // mocking a persisted entity return (usually with a generated id)
  }

  async update(entity:T) {
    await this.validate(entity, true);
    this.repo[this.repo.findIndex(
      repoEntity => this.key(repoEntity) === this.key(entity))] = entity;
  }

  async delete(key: K) {
    await this.validateKey(key,true);
    this.repo.splice(this.repo.findIndex(
      repoEntity => this.key(repoEntity) === key), 1);
  }

  protected abstract key(entity:T):K;

  protected async validate(entity:T, shouldExist:boolean) {
    await this.validateKey(this.key(entity), shouldExist);
  }

  protected async validateKey(key:K, shouldExist:boolean) {
    const foundEntity:T = await this.findOne(key);
    if (!shouldExist && foundEntity)
      throw CrudService.ALREADY_EXISTS_ERROR;
    if (shouldExist && !foundEntity)
      throw CrudService.NOT_EXIST_ERROR;
  }


}