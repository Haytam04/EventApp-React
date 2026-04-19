export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  // These now pull from your .env file
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error.message);
    }

    const data = await res.json();
    return data.secure_url; // This is the HTTPS link for Firestore
  } catch (error) {
    console.error("Cloudinary Upload failed:", error);
    throw error;
  }
};