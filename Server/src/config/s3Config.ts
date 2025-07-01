import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { configDotenv } from 'dotenv';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


configDotenv();

export const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        
    }
})

export const generateSignedUrl = async (url : string | undefined ) => {
    try {

        let key = url;

        const expiresIn = 3600;
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        })

        return await getSignedUrl(s3, command, {expiresIn})
        
    } catch (error) {
        console.log(`error in generateSignedUrl ${error}`);
        
    }
}

