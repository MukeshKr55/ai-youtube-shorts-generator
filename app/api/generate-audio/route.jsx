import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/config/FirebaseConfig";
import { NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(req) {
  try {
    const { text, id, voice } = await req.json();
    if (!text || !id || !voice) {
      return NextResponse.json(
        { message: "Text and ID are required to generate audio" },
        { status: 400 }
      );
    }
    console.log("VOICE: ", voice);
    const storageRef = ref(storage, `ai-shorts-files/${id}.wav`);
    const client = await Client.connect(
      "mukeshkr5/Edge-TTS-Text-to-Speech-mukeshkr5"
    );

    const result = await client.predict("/predict", {
      text,
      voice,
      rate: 5,
      pitch: 0,
    });
    if (!result || !result.data || !result.data[0] || !result.data[0].url) {
      throw new Error(
        "Failed to retrieve audio file URL from Hugging Face model"
      );
    }
    const audioUrl = result.data[0].url;
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio file from ${audioUrl}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    await uploadBytes(storageRef, audioBuffer, { contentType: "audio/wav" });
    const downloadUrl = await getDownloadURL(storageRef);
    console.log("AUDIO URL: ", downloadUrl);

    return NextResponse.json({ result: downloadUrl });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to generate audio", error: error.message },
      { status: 500 }
    );
  }
}
