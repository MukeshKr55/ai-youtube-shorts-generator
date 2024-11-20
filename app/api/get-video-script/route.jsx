import { NextResponse } from "next/server";
import { chatSession } from "@/config/AiModel";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const result = await chatSession.sendMessage(prompt);
    const rawResponse = await result.response.text();
    console.log(rawResponse);

    // Remove potential inline comments and extra characters not suitable for JSON
    const sanitizedResponse = rawResponse
      .replace(/\/\/.*?(\n|$)/g, "") // Removes comments
      .replace(/[\r\n\t]/g, "") // Removes newlines and tabs
      .trim();

    // Validate if the response starts and ends correctly for JSON array format
    if (
      sanitizedResponse.charAt(0) !== "[" ||
      sanitizedResponse.charAt(sanitizedResponse.length - 1) !== "]"
    ) {
      throw new Error("Response is not a valid JSON array.");
    }

    // Attempt to parse the response
    let parsedResult;
    try {
      parsedResult = JSON.parse(sanitizedResponse);
    } catch (parseError) {
      console.error(
        "[ERROR] JSON parsing failed. Response might have unexpected characters or be improperly formatted."
      );
      throw new Error(`JSON parsing error: ${parseError.message}`);
    }

    return NextResponse.json({ result: parsedResult });
  } catch (e) {
    console.error(`[ERROR] An error occurred: ${e.message}`, e);
    return NextResponse.json({ Error: e.message });
  }
}
