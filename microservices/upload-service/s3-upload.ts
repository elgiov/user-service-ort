import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

export const uploadToS3 = async (buffer: Buffer, key: string, contentType: string): Promise<string> => {
    if (!process.env.AWS_S3_BUCKET_NAME) {
        throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (error: any, data: { Location?: string | PromiseLike<string> }) => {
            if (error) {
                reject(error);
            } else {
                const imageUrl = data.Location;
                if (imageUrl) {
                    const imageName = typeof imageUrl === 'string' ? imageUrl.split('/').pop() : undefined;
                    if (imageName) {
                        resolve(imageName);
                    } else {
                        reject(new Error('Failed to extract image name from URL'));
                    }
                } else {
                    reject(new Error('No image URL returned'));
                }
            }
        });
    });
};

export const getImageFromS3 = async (key: string): Promise<Buffer> => {
    if (!process.env.AWS_S3_BUCKET_NAME) {
        throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
    }

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
    };

    return new Promise((resolve, reject) => {
        s3.getObject(params, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.Body as Buffer);
            }
        });
    });
};
