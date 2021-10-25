import { BadRequestException, Injectable, MethodNotAllowedException } from '@nestjs/common';
import { Product } from './product';
import { CrudService } from '../common/crud.service';

@Injectable()
export class ProductService extends CrudService<Product, string> {

  public static readonly INVALID_PRODUCT_ERROR:BadRequestException =
    new BadRequestException('Invalid product');

  async findAll(): Promise<Product[]> {
    throw new MethodNotAllowedException('Find all not supported');
  }

  protected key(product:Product):string {
    return product.productName;
  }

  // since the smallest change is 5, need to validate that product price is a multiples of 5
  protected async validate(product:Product, shouldExist:boolean) {
    if (!product || !product.productName || product.cost % 5 > 0)
      throw ProductService.INVALID_PRODUCT_ERROR;
    return super.validate(product, shouldExist);
  }

}