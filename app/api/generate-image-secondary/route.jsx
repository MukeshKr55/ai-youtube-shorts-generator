import { NextResponse } from "next/server";
import axios from "axios";
import { storage } from "@/config/FirebaseConfig";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

export async function POST(req) {
  const { prompt } = await req.json();

  console.log("text from image api1---", prompt);

  if (!prompt) {
    return NextResponse.json({ message: "Prompt is required" });
  }

  try {
    // Set the response type to "arraybuffer" to get binary data
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        },
        responseType: "arraybuffer", // Get binary data
      }
    );

    // Convert the binary data to a base64-encoded string
    const imageBase64 = Buffer.from(response.data, "binary").toString("base64");

    // Create a data URL for the image
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    // Save to Firebase
    const storageRef = ref(storage, `ai-shorts-files/${Date.now()}.png`);
    await uploadString(storageRef, imageUrl, "data_url");
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(downloadUrl);

    return NextResponse.json({ downloadUrl });
  } catch (e) {
    console.error("Error generating image:", e);
    return NextResponse.json({ Error: e.message || "An error occurred" });
  }
}
