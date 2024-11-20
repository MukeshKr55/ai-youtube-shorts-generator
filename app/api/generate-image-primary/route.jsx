import { NextResponse } from "next/server";
import axios from "axios";
import { storage } from "@/config/FirebaseConfig";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

export async function POST(req) {
  const { prompt, style } = await req.json();
  console.log("STYLE:", style);

  if (!prompt) {
    return NextResponse.json({ message: "Prompt is required" });
  }

  let apiUrl = "";
  let triggerWord = "";

  // Determine the API URL and trigger word based on style
  switch (style) {
    case "Anime":
    case "Digital Art":
      apiUrl =
        "https://api-inference.huggingface.co/models/strangerzonehf/Flux-Animex-v2-LoRA";
      triggerWord = "Animex";
      break;

    case "Realistic":
      apiUrl =
        "https://api-inference.huggingface.co/models/prithivMLmods/Flux-Realism-FineDetailed";
      triggerWord = "Fine Detailed";
      break;

    case "Pixar 3D":
      apiUrl =
        "https://api-inference.huggingface.co/models/prithivMLmods/Canopus-Pixar-3D-Flux-LoRA";
      triggerWord = "Pixar 3D";
      break;

    case "Pencil Sketch":
      apiUrl =
        "https://api-inference.huggingface.co/models/prithivMLmods/Super-Pencil-Flux-LoRA";
      triggerWord = "Simple Pencil";
      break;

    case "Retro Pixel":
      apiUrl =
        "https://api-inference.huggingface.co/models/prithivMLmods/Retro-Pixel-Flux-LoRA";
      triggerWord = "Retro Pixel";
      break;

    case "Abstract":
      apiUrl =
        "https://api-inference.huggingface.co/models/prithivMLmods/Abstract-Cartoon-Flux-LoRA";
      triggerWord = "Abstract";
      break;

    case "Super Blend":
      apiUrl =
        "https://api-inference.huggingface.co/models/strangerzonehf/Flux-Super-Blend-LoRA";
      triggerWord = "Super Blend";
      break;

    default:
      apiUrl =
        "https://api-inference.huggingface.co/models/strangerzonehf/Flux-Midjourney-Mix-LoRA";
      triggerWord = "midjourney mix";
      break;
  }
  console.log(`Using URL - ${apiUrl}`);

  try {
    const response = await axios.post(
      apiUrl,
      {
        inputs: `${triggerWord}, ${prompt}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        },
        responseType: "arraybuffer",
      }
    );

    const imageBase64 = Buffer.from(response.data, "binary").toString("base64");

    const imageUrl = `data:image/png;base64,${imageBase64}`;

    const storageRef = ref(storage, `ai-shorts-files/${Date.now()}.png`);
    await uploadString(storageRef, imageUrl, "data_url");
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(downloadUrl);

    return NextResponse.json({ downloadUrl });
  } catch (e) {
    console.error("Error generating image-c:", e);
    return NextResponse.json({ Error: e.message || "An error occurred" });
  }
}
