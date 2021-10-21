import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, HttpStatus, Inject,
  NotFoundException,
  Param,
  Post,
  Put, Query,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { Product } from './product';
import { ProductService } from './product.service';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProductOwnerGuard } from '../auth/product-owner.guard';

/**
 * NestJS consumes and produces "application/json" by default
 */
@Controller('product')
export class ProductController {

  constructor(@Inject(ProductService) private readonly productService:ProductService) {}


  @Get(':productName')
  async get(@Param('productName') productName: string): Promise<Product> {
    const product:Product = await this.productService.findOne(productName);
    if (product) return product;
    else throw new NotFoundException('Product not found');
  }

  // POST returning 204 by default
  // Endpoint access with username + password api key
  @Post()
  @Roles(Role.SELLER)
  @UseGuards(LocalAuthGuard, RolesGuard, ProductOwnerGuard)
  async create(
      @Query('username') username:string,
      @Query('password') password:string,
      @Body() product:Product):Promise<Product> {
    return this.productService.create(product);
  }

  // Endpoint access with username + password api key
  @Put(':productName')
  @Roles(Role.SELLER)
  @UseGuards(LocalAuthGuard, RolesGuard, ProductOwnerGuard)
  async update(
      @Query('username') username:string,
      @Query('password') password:string,
      @Param('productName') productName: string,
      @Body() product:Product) {
    return this.productService.update(product);
  }

  // Endpoint access with username + password api key
  @Delete(':productName')
  @Roles(Role.SELLER)
  @UseGuards(LocalAuthGuard, RolesGuard, ProductOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
      @Query('username') username:string,
      @Query('password') password:string,
      @Param('productName') productName: string,
      @Body() product:Product) {
    return this.productService.delete(productName);
  }

}