// services/llmService.js

const BASE_URL =
  process.env.LLM_BASE_URL ||
  process.env.OLLAMA_URL ||
  "http://127.0.0.1:1234/v1";

const TEXT_MODEL =
  process.env.TEXT_MODEL ||
  "google/gemma-3-4b";

const VISION_MODEL =
  process.env.VISION_MODEL ||
  "qwen2.5-vl-3b-instruct";

const API_KEY = process.env.LLM_API_KEY || "";

const TIMEOUT = 600000;

/* =====================================================
   COMMON LM STUDIO CALL
===================================================== */

const callLMStudio = async (model, messages, options = {}) => {
  const url = `${BASE_URL.replace(/\/$/, "")}/chat/completions`;

  const body = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 3000,
    stream: false
  };

  // Optional structured JSON output
  if (options.schema) {
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "output",
        strict: true,
        schema: options.schema
      }
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY
        ? {
            Authorization: `Bearer ${API_KEY}`
          }
        : {})
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT)
  });

  if (!response.ok) {
    const errorText = await response.text();

    const error = new Error(
      `LM Studio error ${response.status}: ${errorText}`
    );

    error.status = response.status;

    throw error;
  }

  const data = await response.json();

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from LM Studio");
  }

  return content;
};


/* =====================================================
   TEXT MODEL
   Gemma 3 4B
===================================================== */

const generateFromLLM = async (
  prompt,
  options = {}
) => {
  try {
    const language =
      options.language ||
      "English";

    const languageInstruction =
      language.toLowerCase() === "hindi"
        ? `
OUTPUT LANGUAGE:
Hindi

Write the complete answer in natural Hindi.
Keep technical terms, product names, company names and proper nouns in English when appropriate.
`
        : language.toLowerCase() === "hinglish"
        ? `
OUTPUT LANGUAGE:
Hinglish

Use natural Hindi-English mixed language.
Keep technical terms, product names, company names and proper nouns in English.
`
        : `
OUTPUT LANGUAGE:
English

Write the complete answer in clear natural English.
`;

    const systemPrompt = `
You are NITOGEN, a local AI content transformation engine.

You must follow the user's requested output structure exactly.

${languageInstruction}

IMPORTANT:
- Return ONLY one valid JSON object.
- Do NOT use markdown.
- Do NOT use code fences.
- Do NOT add explanations outside JSON.
- Do NOT invent facts.
- Use only information provided in the source/content brief.
`;

    try {
      return await callLMStudio(
        TEXT_MODEL,
        [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        options
      );
    } catch (error) {

      // Some LM Studio/model combinations
      // may reject json_schema.
      if (
        options.schema &&
        error.status === 400
      ) {
        const retryOptions = {
          ...options
        };

        delete retryOptions.schema;

        return await callLMStudio(
          TEXT_MODEL,
          [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          retryOptions
        );
      }

      throw error;
    }

  } catch (error) {

    console.error(
      "Gemma LLM Error:",
      error.message
    );

    throw new Error(
      `Local text LLM request failed: ${error.message}`
    );
  }
};


/* =====================================================
   VISION MODEL
   Qwen2.5-VL 3B
===================================================== */

const generateFromVision = async (
  prompt,
  imageBase64,
  options = {}
) => {
  try {

    if (!imageBase64) {
      throw new Error(
        "Image data is required for vision generation"
      );
    }

    const mimeType =
      options.mimeType ||
      "image/jpeg";

    const systemPrompt = `
You are NITOGEN's visual analysis engine.

Analyze the provided image carefully.

Return ONLY one valid JSON object.
Do NOT use markdown.
Do NOT use code fences.
Do NOT add explanations outside JSON.

Do not invent visual information.
Only describe information that can actually be inferred from the image.
`;

    return await callLMStudio(
      VISION_MODEL,
      [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      {
        temperature:
          options.temperature ?? 0.1,

        maxTokens:
          options.maxTokens ?? 1500
      }
    );

  } catch (error) {

    console.error(
      "Qwen Vision Error:",
      error.message
    );

    throw new Error(
      `Local vision LLM request failed: ${error.message}`
    );
  }
};


/* =====================================================
   CONFIG
===================================================== */

const getLLMConfig = () => ({
  baseUrl: BASE_URL,
  textModel: TEXT_MODEL,
  visionModel: VISION_MODEL
});


/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  generateFromLLM,
  generateFromVision,
  getLLMConfig
};