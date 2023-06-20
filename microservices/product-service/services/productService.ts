import { ObjectId } from 'mongoose';
import { Product, IProduct } from '../models/product';
import { uploadToS3 } from '../../upload-service/service/s3-upload';
import { ProductSubscription } from '../models/productSubscription';
import axios, { AxiosResponse } from 'axios';
import { sendProductStockEmail } from '../../user-service/services/emailService';

export const createProduct = async ({ name, description, image, price, quantity, company }: IProduct): Promise<IProduct> => {
    try {
        const newProduct = new Product({ name, description, image, price, quantity, company });
        const product = await newProduct.save();
        return product;
    } catch (error) {
        throw new Error('Could not create a new product');
    }
};

export const updateProduct = async (name: string, company: ObjectId, update: Partial<IProduct>): Promise<IProduct | null> => {
    try {
        const existingProduct = await getProduct(name, company);
        if (!existingProduct) {
            return null;
        }

        if (update.name && update.name !== existingProduct.name) {
            const productWithNewName = await getProduct(update.name, company);
            if (productWithNewName) {
                throw new Error(`A product with name "${update.name}" already exists`);
            }
        }
        const updatedProduct = await Product.findOneAndUpdate({ name, company }, { ...existingProduct.toObject(), ...update }, { new: true });
        return updatedProduct;
    } catch (error: any) {
        throw new Error(`Could not update product with name "${name}": ${error.message}`);
    }
};

export const deleteProduct = async (name: string, company: ObjectId): Promise<IProduct | null> => {
    try {
        const existingProduct = await getProduct(name, company);
        if (!existingProduct) {
            return null;
        }

        const updatedProduct = await Product.findOneAndUpdate({ name, company }, { deleted: true }, { new: true });
        return updatedProduct;
    } catch (error: any) {
        throw new Error(`Could not delete product with name "${name}": ${error.message}`);
    }
};

export const getProduct = async (name: string, company: ObjectId) => {
    const product = await Product.findOne({ name, company });
    return product;
};

export const getProductsByCompany = async (company: ObjectId) => {
    try {
        const products = await Product.find({ company, deleted: false });
        return products;
    } catch (error: any) {
        throw new Error(`Could not get products for company "${company}": ${error.message}`);
    }
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

export const decreaseProductQuantity = async (productId: string, quantity: number): Promise<void> => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error(`Product with id "${productId}" not found`);
        }

        if (product.quantity < quantity) {
            throw new Error(`Insufficient stock for product with id "${productId}"`);
        }

        product.quantity -= quantity;
        await product.save();

        // Check if product stock is depleted and send an email notification
        if (product.quantity === 0) {
            await sendProductStockEmail(product._id.toHexString());
        }
    } catch (error: any) {
        throw new Error(`Could not decrease quantity for product with id "${productId}": ${error.message}`);
    }
};

export const getProductById = async (id: string): Promise<IProduct | null> => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new Error(`Product with id "${id}" not found`);
        }
        return product;
    } catch (error: any) {
        throw new Error(`Could not get product with id "${id}": ${error.message}`);
    }
};

export async function subscribeToProduct(adminId: any, productId: string) {
    try {
        const productSubscription = new ProductSubscription({ adminId, productId });
        await productSubscription.save();
    } catch (error) {
        throw new Error('Could not subscribe to product');
    }
}

export async function subscribeToProductStock(adminId: any, productId: string) {
    try {
        const productSubscription = new ProductSubscription({ adminId, productId, isStock: true });
        await productSubscription.save();
    } catch (error) {
        throw new Error('Could not subscribe to product stock');
    }
}

export async function unsubscribeFromProductStock(adminId: any, productId: string) {
    try {
        await ProductSubscription.findOneAndDelete({ adminId, productId, isStock: true });
    } catch (error) {
        throw new Error('Could not unsubscribe from product stock');
    }
}

export async function unsubscribeFromProduct(adminId: any, productId: string) {
    try {
        const result = ProductSubscription.findOneAndDelete({ adminId, productId });
        return result;
    } catch (error) {
        throw new Error('Could not unsubscribe from product');
    }
}

export async function isSubscribedToProduct(adminId: any, productId: string) {
    try {
        const productSubscription = await ProductSubscription.findOne({ adminId, productId, isStock: false });
        return !!productSubscription;
    } catch (error) {
        throw new Error('Could not check if subscribed to product');
    }
}

export async function isSubscribedToProductStock(adminId: any, productId: string) {
    try {
        const productSubscription = await ProductSubscription.findOne({ adminId, productId, isStock: true });
        return !!productSubscription;
    } catch (error) {
        throw new Error('Could not check if subscribed to product stock');
    }
}

export async function getSubscribedAdminsToProduct(productId: string) {
    try {
        const productSubscriptions = await ProductSubscription.find({ productId, isStock: false });
        if (!productSubscriptions) {
            return [];
        }
        const adminIds = productSubscriptions.map((productSubscription) => productSubscription.adminId);

        if (adminIds?.length === 0) {
            return [];
        }

        const admins = (await Promise.all(adminIds.map((adminId) => getAdminById(adminId)))) as AxiosResponse<any>[];

        if (admins?.length === 0) {
            return [];
        }

        const uniqueAdminEmails = [...new Set(admins.map((admin) => admin.data.email))];
        return uniqueAdminEmails;
    } catch (error) {
        throw new Error('Could not check if subscribed to product');
    }
}

export async function getSubscribedAdminsToProductStock(productId: string) {
    try {
        const productSubscriptions = await ProductSubscription.find({ productId, isStock: true });
        if (!productSubscriptions) {
            return [];
        }
        const adminIds = productSubscriptions.map((productSubscription) => productSubscription.adminId);

        if (adminIds?.length === 0) {
            return [];
        }

        const admins = (await Promise.all(adminIds.map((adminId) => getAdminById(adminId)))) as AxiosResponse<any>[];

        if (admins?.length === 0) {
            return [];
        }

        const uniqueAdminEmails = [...new Set(admins.map((admin) => admin.data.email))];
        return uniqueAdminEmails;
    } catch (error) {
        throw new Error('Could not check if subscribed to product stock');
    }
}

async function getAdminById(adminId: string): Promise<any> {
    try {
        const admin = await axios.get(`http://localhost:3005/api/users/byId/${adminId}`);
        return admin;
    } catch (error) {
        throw new Error('Could not get admin by id');
    }
}
