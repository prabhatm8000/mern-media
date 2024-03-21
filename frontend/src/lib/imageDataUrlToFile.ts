export const imageDataUrlToFile = (imageDataUrl: string): File => {
    // Convert data URL to binary data
    const binaryData = atob(imageDataUrl.split(",")[1]);

    // Create a Uint8Array to hold the binary data
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    // Populate the Uint8Array with the binary data
    for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
    }

    // Create a Blob from the Uint8Array
    const blob = new Blob([uint8Array], { type: "image/jpeg" });

    // Create a File object from the Blob
    const imageFile = new File([blob], "profile_picture", {
        type: "image/jpeg",
    });

    return imageFile;
};
