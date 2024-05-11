import cloudinary from "cloudinary";

export const connectToCloudinary = ({
    cloud_name,
    api_key,
    api_secret,
}: {
    cloud_name: string;
    api_key: string;
    api_secret: string;
}) => {
    cloudinary.v2.config({
        cloud_name,
        api_key,
        api_secret,
    });
};

// Function to extract public ID from URL
export function getPublicIdFromUrl(
    url: string,
    imageType: "PROFILE_PICTURE" | "POST_IMAGES"
): string | null {
    // Extract public ID from Cloudinary URL
    let section;
    if (imageType === "PROFILE_PICTURE") {
        section = "postIt/profilePicture/";
    } else if (imageType === "POST_IMAGES") {
        section = "postIt/posts/";
    } else {
        return null;
    }

    try {
        const publicId = section + url.split(section)[1].split(".")[0];
        return publicId;
    } catch (error) {
        return null;
    }
}

// Delete image using public URL
export async function deleteImageByURL(
    publicURL: string,
    imageType: "PROFILE_PICTURE" | "POST_IMAGES"
) {
    const publicId = getPublicIdFromUrl(publicURL, imageType);
    if (publicId) {
        await cloudinary.v2.uploader.destroy(publicId);
    }
}

export async function uploadProfilePicture(imageFile: Express.Multer.File) {
    // converting image to base64 string
    const base64 = Buffer.from(imageFile.buffer).toString("base64");

    let dataURI = `data:${imageFile.mimetype};base64,${base64}`;

    const res = await cloudinary.v2.uploader.upload(dataURI, {
        folder: "postIt/profilePicture",
    });

    // returning public url for the uploaded image
    return res.url;
}

export async function uploadPostImages(imageFiles: Express.Multer.File[]) {
    const uploadPromises = imageFiles.map(async (image) => {
        // converting image to base64 string
        const base64 = Buffer.from(image.buffer).toString("base64");

        let dataURI = `data:${image.mimetype};base64,${base64}`;

        const res = await cloudinary.v2.uploader.upload(dataURI, {
            folder: "postIt/posts",
        });

        // returning public url for the uploaded image
        return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
}

export async function uploadAttachmentImages(
    imageFiles: Express.Multer.File[],
    chatId: string
) {
    const uploadPromises = imageFiles.map(async (image) => {
        // converting image to base64 string
        const base64 = Buffer.from(image.buffer).toString("base64");

        let dataURI = `data:${image.mimetype};base64,${base64}`;

        const res = await cloudinary.v2.uploader.upload(dataURI, {
            folder: `postIt/attachments/${chatId}`,
        });

        // returning public url for the uploaded image
        return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
}

async function emptyAttachmentFolder(chatId: string) {
    try {
        // Construct the folder path
        const folderPath = `postIt/attachments/${chatId}`;

        // Fetch all resources (images) in the folder
        const { resources } = await cloudinary.v2.api.resources({
            type: "upload",
            prefix: folderPath,
        });

        // Delete each resource (image) in the folder
        const deletePromises = resources.map((resource: any) => {
            return cloudinary.v2.api.delete_resources(resource.public_id);
        });

        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error emptying folder:", error);
        throw error;
    }
}

export async function deleteAttachmentFolder(chatId: string) {
    await emptyAttachmentFolder(chatId);
    await cloudinary.v2.api.delete_folder(`postIt/attachments/${chatId}`);
}
