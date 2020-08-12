import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IProductDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface IProductN {
  product_id: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {
    //
  }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError(`This customer id don't exist`, 400);
    }

    const productsId = products.map(product => {
      return { id: product.id };
    });

    const productsData = await this.productsRepository.findAllById(productsId);

    if (!productsData || productsData.length !== products.length) {
      throw new AppError(
        'The list of products is invalid, verify the IDs',
        400,
      );
    }

    const productsList = productsData.map(productData => {
      const productFinal = products.find(
        productFinded => productFinded.id === productData.id,
      );

      if (productFinal && productData.quantity < productFinal?.quantity) {
        throw new AppError(
          `The stock of product: ${productData.name} is insufficient`,
          400,
        );
      }

      return {
        product_id: productData.id,
        price: productData.price,
        quantity: productFinal?.quantity || 0,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsList,
    });

    const { order_products } = order;

    const orderProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        productsData.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
