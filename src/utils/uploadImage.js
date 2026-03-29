export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "your_unsigned_preset_name"); // The one you created in Step 1
  formData.append("cloud_name", "your_cloud_name");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return data.secure_url; // This is the link we save to Firestore
  } catch (error) {
    console.error("Upload failed", error);
  }
};