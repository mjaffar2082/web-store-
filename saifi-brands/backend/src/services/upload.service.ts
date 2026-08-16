import cloudinary from "../utils/cloudinary";
import { UploadApiResponse } from "cloudinary";

export async function uploadImage(file: Express.Multer.File, folder: string = "products"): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `saifi-brands/${folder}`,
        transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result!);
      }
    );
    uploadStream.end(file.buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/");
  const fileWithExtension = parts[parts.length - 1];
  const file = fileWithExtension.split(".")[0];
  const folder = parts[parts.length - 2];
  return `saifi-brands/${folder}/${file}`;
}
