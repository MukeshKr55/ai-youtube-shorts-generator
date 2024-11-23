import { NextResponse } from "next/server";
import { storage } from "@/config/FirebaseConfig";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

export async function POST(req) {
  const { images } = await req.json();

  if (!images || !Array.isArray(images)) {
    return NextResponse.json(
      { message: "Images array is required" },
      { status: 400 }
    );
  }

  try {
    console.log("Uploading Images to firebase.....");
    const uploadPromises = images.map(async (imageBase64, index) => {
      const storageRef = ref(
        storage,
        `ai-shorts-files/${Date.now()}-${index}.png`
      );
      await uploadString(storageRef, imageBase64, "data_url");
      return getDownloadURL(storageRef);
    });

    const downloadUrls = await Promise.all(uploadPromises);
    console.log("Download URLS");

    console.log(downloadUrls);

    return NextResponse.json({ downloadUrls });
  } catch (e) {
    console.error("Error uploading images:", e.message);
    return NextResponse.json(
      { error: e.message || "An error occurred" },
      { status: 500 }
    );
  }
}
