import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productListId = products.map(product => {
      return product.id;
    });

    const productsList = await this.ormRepository.find({
      id: In(productListId),
    });

    return productsList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    // deverá subtrair a quantidade do total que já está gravado
    // const productsData = await this.findAllById(products);

    // const newProds = productsData.map(pd => {
    //   const prodFind = products.find(product => product.id === pd.id);
    //   const newProd = pd;
    //   if (prodFind) {
    //     newProd.quantity -= prodFind.quantity;
    //   }

    //   return newProd;
    // });

    // await this.ormRepository.save(newProds);

    // return newProds;

    return this.ormRepository.save(products);
  }
}

export default ProductsRepository;
