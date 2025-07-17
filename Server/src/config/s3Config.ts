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

export const generateSignedUrl = async (url : string | undefined ) => {
    try {

        let key = url;

        const expiresIn = 3600;
        const command = new GetObjectCommand({
            Bucket: config.awsBucketName,
            Key: key
        })

        return await getSignedUrl(s3, command, {expiresIn})
        
    } catch (error) {
        console.log(`error in generateSignedUrl ${error}`);
        
    }
}

