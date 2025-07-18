import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { configDotenv } from 'dotenv';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from '../config';


configDotenv();

export const s3 = new S3Client({
    region: config.awsRegion,
    credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
        
    }
})

export const getPresignedDownloadUrl = async (key : string): Promise<string | undefined> => {
    try {

        const command = new GetObjectCommand({
            Bucket: config.awsBucketName,
            Key: key
        })

        return getSignedUrl(s3, command, {expiresIn: 60 * 10})
        
    } catch (error) {
        console.log(`error in generateSignedUrl ${error}`);
        
    }
}

