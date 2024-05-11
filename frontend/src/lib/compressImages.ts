export const compressImages = async (fileList: FileList): Promise<FileList> => {
    const compressedFiles: File[] = [];

    // Helper function to resize and compress the image
    const resizeAndCompressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d')!;
                        const maxSize = 1000; // Maximum width or height after compression

                        let width = img.width;
                        let height = img.height;

                        // Resize the image if it exceeds the maximum size
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height *= maxSize / width;
                                width = maxSize;
                            } else {
                                width *= maxSize / height;
                                height = maxSize;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw the image onto the canvas with the new dimensions
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert the canvas to a Blob
                        canvas.toBlob((blob) => {
                            if (blob) {
                                // Create a new File object with the compressed image data
                                const compressedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
                                resolve(compressedFile);
                            }
                        }, 'image/jpeg', 0.7); 
                    };
                    img.src = event.target.result as string;
                }
            };
            reader.readAsDataURL(file);
        });
    };

    // Loop through each file in the FileList and compress it
    for (let i = 0; i < fileList.length; i++) {
        const compressedFile = await resizeAndCompressImage(fileList[i]);
        compressedFiles.push(compressedFile);
    }

    // Create a new DataTransfer object and append the compressed files
    const dataTransfer = new DataTransfer();
    compressedFiles.forEach((file) => {
        dataTransfer.items.add(file);
    });

    // Return the files as a FileList
    return dataTransfer.files;
};
