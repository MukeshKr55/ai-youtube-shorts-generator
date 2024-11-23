import { serve } from "inngest/next";
import { inngest } from "../../inngest/client";
import { generateShort } from "../../inngest/functions";

export const runtime = "edge";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  streaming: "allow",
  functions: [
    /* your functions will be passed here later! */

    generateShort,
  ],
});