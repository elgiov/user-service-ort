import { Product, IProduct } from '../models/product';

export const createProduct = async ({ name, description, image, price, quantity }: IProduct): Promise<IProduct> => {
    try {
        const newProduct = new Product({ name, description, image, price, quantity  });
        const product = await newProduct.save();
        return product;
    } catch (error) {
        throw new Error('Could not create a new product');
    }
};

export const getProductByName = async (name:string) => {
    const product = await Product.findOne({name});
    return product;
}