import { Product, IProduct } from '../models/product';
import { uploadToS3 } from './s3-upload';
import { ProductDocument } from '../models/product';

export const createProduct = async ({ name, description, image, price, quantity }: IProduct): Promise<IProduct> => {
    try {
        const newProduct = new Product({ name, description, image, price, quantity });
        const product = await newProduct.save();
        return product;
    } catch (error) {
        throw new Error('Could not create a new product');
    }
};

export const updateProduct = async (productName: string, update: Partial<IProduct>): Promise<IProduct | null> => {
    try {
        const existingProduct = await getProductByName(productName);
        if (!existingProduct) {
            return null;
        }

        if (update.name && update.name !== existingProduct.name) {
            const productWithNewName = await getProductByName(update.name);
            if (productWithNewName) {
                throw new Error(`A product with name "${update.name}" already exists`);
            }
        }
        const updatedProduct = await Product.findOneAndUpdate({ name: productName }, { ...existingProduct.toObject(), ...update }, { new: true });
        return updatedProduct;
    } catch (error: any) {
        throw new Error(`Could not update product with name "${productName}": ${error.message}`);
    }
};

export const deleteProduct = async (productName: string): Promise<IProduct | null> => {
    try {
        const existingProduct = await getProductByName(productName);
        if (!existingProduct) {
            return null;
        }

        const updatedProduct = await Product.findOneAndUpdate({ name: productName }, { deleted: true }, { new: true });
        return updatedProduct;
    } catch (error: any) {
        throw new Error(`Could not delete product with name "${productName}": ${error.message}`);
    }
};

export const getProductByName = async (name: string) => {
    const product = await Product.findOne({ name });
    return product;
};

export const uploadImage = async (buffer: Buffer, name: string): Promise<string> => {
    try {
        const imageKey = `products/${Date.now()}-${name}`;
        const image = await uploadToS3(buffer, imageKey, 'image/jpeg');
        return image;
    } catch (error) {
        throw new Error('Could not upload the image');
    }
};
