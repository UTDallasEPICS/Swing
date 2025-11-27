"use server";

import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { nanoid } from "nanoid";

export async function onSubmit(formData: FormData) {
  try {
    const client = new S3Client({
      region: process.env.AWS_REGION,
    });

    // Upload before video
    const beforeVideo = formData.get("beforeVideo") as File;
    if (!beforeVideo) {
      throw new Error("Before video is required");
    }

    const beforeKey = `before-${nanoid()}`;
    const { url: beforeUrl, fields: beforeFields } = await createPresignedPost(
      client,
      {
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: beforeKey,
      },
    );

    const beforeFormData = new FormData();
    Object.entries(beforeFields).forEach(([key, value]) => {
      beforeFormData.append(key, value);
    });
    beforeFormData.append("file", beforeVideo);

    const beforeResponse = await fetch(beforeUrl, {
      method: "PUT",
      body: beforeFormData,
    });

    if (!beforeResponse.ok) {
      throw new Error("Failed to upload before video");
    }

    // Upload after video
    const afterVideo = formData.get("afterVideo") as File;
    if (!afterVideo) {
      throw new Error("After video is required");
    }

    const afterKey = `after-${nanoid()}`;
    const { url: afterUrl, fields: afterFields } = await createPresignedPost(
      client,
      {
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: afterKey,
      },
    );

    const afterFormData = new FormData();
    Object.entries(afterFields).forEach(([key, value]) => {
      afterFormData.append(key, value);
    });
    afterFormData.append("file", afterVideo);

    const afterResponse = await fetch(afterUrl, {
      method: "PUT",
      body: afterFormData,
    });

    if (!afterResponse.ok) {
      throw new Error("Failed to upload after video");
    }

    // Here you would typically trigger your video analysis process
    // For now, we'll just return success
    return {
      success: true,
      message: "Videos uploaded successfully",
      beforeKey,
      afterKey,
    };
  } catch (err: any) {
    console.error("Upload error:", err);
    return {
      success: false,
      message: err.message || "An error occurred during video upload",
    };
  }
}
