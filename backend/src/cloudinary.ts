import cloudinary from "cloudinary";

// Function to extract public ID from URL
function getPublicIdFromUrl(
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
export async function deleteImageByURL(publicURL: string, imageType: "PROFILE_PICTURE" | "POST_IMAGES") {
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
