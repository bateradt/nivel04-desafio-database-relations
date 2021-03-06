import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import console from 'console';
import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {
    //
  }

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    const productByNameExist = await this.productsRepository.findByName(name);

    if (productByNameExist) {
      throw new AppError('This product already exists.', 400);
    }

    const product = await this.productsRepository.create({
      name,
      price,
      quantity,
    });
    return product;
  }
}

export default CreateProductService;
