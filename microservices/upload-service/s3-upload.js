"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageFromS3 = exports.uploadToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const uploadToS3 = (buffer, key, contentType) => __awaiter(void 0, void 0, void 0, function* () {
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
        s3.upload(params, (error, data) => {
            if (error) {
                reject(error);
            }
            else {
                const imageUrl = data.Location;
                if (imageUrl) {
                    const imageName = typeof imageUrl === 'string' ? imageUrl.split('/').pop() : undefined;
                    if (imageName) {
                        resolve(imageName);
                    }
                    else {
                        reject(new Error('Failed to extract image name from URL'));
                    }
                }
                else {
                    reject(new Error('No image URL returned'));
                }
            }
        });
    });
});
exports.uploadToS3 = uploadToS3;
const getImageFromS3 = (key) => __awaiter(void 0, void 0, void 0, function* () {
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
            }
            else {
                resolve(data.Body);
            }
        });
    });
});
exports.getImageFromS3 = getImageFromS3;
