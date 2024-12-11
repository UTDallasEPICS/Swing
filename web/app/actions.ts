'use server'

import 'dotenv/config';
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { nanoid } from 'nanoid';
import { text } from 'stream/consumers';

export async function onSubmit(formData: FormData)
{
    try{
        const client = new S3Client ({
            region: process.env.AWS_REGION
        })

        const { url, fields } = await createPresignedPost(client, {
            Bucket: process.env.AWS_BUCKET_NAME || '',
            Key: nanoid()
        })

        const formDataS3 = new FormData()
        Object.entries(fields).forEach(([key, value]) =>
        {
            formDataS3.append(key, value);
        })

        formDataS3.append('file', formData.get('file') as string)
         
        const response = await fetch(url, {
            method: 'PUT',
            body: formDataS3
        })

        const textResponse = await response.text()
        console.log(textResponse)

        if (response.ok)
        {
            console.log("File uploaded")
        }
        else
        {
            console.log("Some error occurred during the file upload")
        }

        console.log(url, fields);
    } catch (err: any)
    {
        console.error(err);
    }
}