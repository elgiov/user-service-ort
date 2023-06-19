// services/companyService.ts
import { Company, ICompany } from '../models/company';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { sendReportEmail } from '../../user-service/services/emailService'
import fs from 'fs';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const createCompany = async (name: string, address: string): Promise<ICompany> => {
    try {
        const newCompany = new Company({ name, address });
        const company = await newCompany.save();
        return company;
    } catch (error) {
        throw new Error('Could not create company');
    }
};

export const getCompanyById = async (id: string): Promise<ICompany | null> => {
    try {
        const company = await Company.findById(id);
        return company;
    } catch (error) {
        throw new Error('Could not fetch company');
    }
};

export const getCompanyByName = async (name: string): Promise<ICompany | null> => {
    try {
        const company = await Company.findOne({ name });
        return company;
    } catch (error: any) {
        throw new Error(`Error fetching company by name: ${error.message}`);
    }
};

export const getCompanies = async (): Promise<ICompany[]> => {
    try {
        const companies = await Company.find();
        return companies;
    } catch (error) {
        throw new Error('Could not fetch companies');
    }
};

export const createReport = async (companyId: string) => {
    try {
        const [sales, purchases] = await Promise.all([
            axios.get(`http://localhost:3001/api/sales/by-company/${companyId}`),
            axios.get(`http://localhost:3004/api/purchases/by-company/${companyId}`)
        ]);

        const salesData = sales.data.sort((a: { total: number }, b: { total: number }) => b.total - a.total);
        const purchaseData = purchases.data.sort((a: { total: number }, b: { total: number }) => b.total - a.total);

        const getProductDetails = async (data: any) => {
            for (let entry of data) {
                for (let product of entry.products) {
                    const productDetails = await axios.get(`http://localhost:3000/api/products/byId/${product.productId || product.product._id}`);
                    product.name = productDetails.data.name; // add the product name to the product object
                }
            }
        };

        await Promise.all([getProductDetails(salesData), getProductDetails(purchaseData)]);

        const documentDefinition = {
            info: {
                title: 'Reporte de Ventas y Compras',
                subject: 'Ventas y compras',
                created: new Date().toISOString()
            },
            content: [
                { text: 'Reporte de Ventas y Compras', style: 'header' },
                { text: `Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, style: 'subheader' },
                { text: 'Ventas', style: 'subheader' },
                ...salesData.map((sale: { _id: any; total: any; products: any[] }) => {
                    return [
                        { text: `ID de venta: ${sale._id}` },
                        { text: `Total: ${sale.total}` },
                        ...sale.products.map((product) => {
                            return { text: `Producto: ${product.name}, Cantidad: ${product.quantity}, Precio: ${product.unitPrice}` };
                        })
                    ];
                }),
                { text: 'Compras', style: 'subheader' },
                ...purchaseData.map((purchase: { _id: any; total: any; products: any[] }) => {
                    return [
                        { text: `ID de compra: ${purchase._id}` },
                        { text: `Total: ${purchase.total}` },
                        ...purchase.products.map((product) => {
                            return { text: `Producto: ${product.name}, Cantidad: ${product.quantity}` };
                        })
                    ];
                })
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    color: '#4472C4',
                    margin: [0, 0, 0, 10] as [number, number, number, number]
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    margin: [0, 10, 0, 5] as [number, number, number, number]
                }
            }
        };

        const pdfDoc = pdfMake.createPdf(documentDefinition);

        return new Promise<Buffer>((resolve, reject) => {
            pdfDoc.getBuffer((buffer: Buffer | undefined) => {
                if (!buffer) {
                    reject(new Error('Failed to generate PDF'));
                } else {
                    resolve(buffer as Buffer);
                }
            });
        });
    } catch (error: any) {
        console.error(`Error generating report: ${error.message}`);
    }
};

export const sendReport = async (email: string, report: Buffer) => {
    try {
        email = 'gioghisellini@gmail.com';
        await sendReportEmail(email, report);
    } catch (error: any) {
        console.error(`Error sending report: ${error.message}`);
    }
}

