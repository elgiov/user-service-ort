import { IProduct, Product } from '../models/product';
import { Provider, IProvider } from '../models/provider';

export const createProvider = async ({ name, address, email, phone }: IProvider, company: string): Promise<IProvider> => {
    try {
        const newProvider = new Provider({ name, address, email, phone, company });
        const provider = await newProvider.save();
        return provider;
    } catch (error) {
        throw new Error('Could not create a new provider');
    }
};

export const updateProvider = async (providerId: string, updateProvider: IProvider): Promise<IProvider | null> => {
    try {
        const provider = await findProviderById(providerId);
        if (!provider) {
            return null;
        }
        const updatedProvider = await Provider.findOneAndUpdate({ _id: providerId }, { ...provider.toObject(), ...updateProvider }, { new: true });
        return updatedProvider;
    } catch (error: any) {
        throw new Error(`Could not update provider with id "${providerId}": ${error.message}`);
    }
};

export const deleteProvider = async (providerId: string): Promise<IProvider | null> => {
    try {
        const provider = await findProviderById(providerId);
        if (!provider) {
            return null;
        }
        const deletedProvider = await Provider.findOneAndUpdate({ _id: providerId }, { deleted: true }, { new: true });
        return deletedProvider;
    } catch (error: any) {
        throw new Error(`Could not delete provider with id "${providerId}": ${error.message}`);
    }
};

export const getProviderProducts = async (provider: IProvider, company: string): Promise<IProduct[]> => {
    try {
        const products = await Product.find({ company: company, provider: provider._id, deleted: false });
        return products;
    } catch (error: any) {
        throw new Error(`Could not get products for provider "${provider.name}": ${error.message}`);
    }
};

export const getProviders = async (company: string): Promise<IProvider[]> => {
    try {
        const providers = await Provider.find({ company: company, deleted: false }).populate('company', 'name');
        return providers;
    } catch (error: any) {
        throw new Error(`Could not get providers: ${error.message}`);
    }
};

export const findProviderById = async (providerId: string): Promise<IProvider> => {
    const provider = await Provider.findById(providerId);
    if (!provider) {
        throw new Error(`Provider with id "${providerId}" not found`);
    }
    return provider;
};
