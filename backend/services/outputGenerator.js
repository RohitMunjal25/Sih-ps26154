const { generateFromLLM } = require("./llmService");

const MAX_ATTEMPTS = 3;

const parseLLMJson = (response) => {
  if (!response) throw new Error("LLM returned empty response");

  let text = response;

  if (typeof response === "object") {
    text =
      response?.content ||
      response?.message?.content ||
      response?.choices?.[0]?.message?.content ||
      "";
  }

  text = String(text).trim();

  if (text.startsWith("```")) {
    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("LLM did not return valid JSON");
  }

  text = text.slice(start, end + 1);

  text = text.replace(/\/\/.*$/gm, "");

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid JSON returned by LLM: " + e.message);
  }
};

const str = (v) =>
  typeof v === "string" && v.trim().length > 0;

const clean = (v) =>
  String(v ?? "").trim();

const toStrArr = (a) =>
  (Array.isArray(a) ? a : [])
    .map((x) =>
      typeof x === "string"
        ? x
        : x?.text || x?.title || ""
    )
    .map(clean)
    .filter(Boolean);

const exact = (arr, n, label, errors) => {
  if (!Array.isArray(arr) || arr.length !== n) {
    errors.push(
      `${label} must contain exactly ${n} items (got ${
        Array.isArray(arr) ? arr.length : 0
      })`
    );
  }
};

const trimTo = (s, max) =>
  s.length <= max
    ? s
    : s.slice(0, max - 1).trimEnd() + "…";

const SPECS = {
  executive_summary: {
    prompt: () => `
Create a decision-ready executive summary.

Return exactly this JSON shape:

{
  "bluf": "",
  "key_points": ["", "", "", ""],
  "risks": ["", "", ""],
  "recommendations": ["", "", ""]
}

Rules:
- bluf: 2-3 sentences.
- key_points: EXACTLY 4 source-based points.
- risks: EXACTLY 3 source-based risks.
- recommendations: EXACTLY 3 specific actionable recommendations.
- Use only information from the Content Brief.
`,
    normalize: (o) => ({
      bluf: clean(o.bluf),
      key_points: toStrArr(o.key_points).slice(0, 4),
      risks: toStrArr(o.risks).slice(0, 3),
      recommendations: toStrArr(o.recommendations).slice(0, 3)
    }),
    validate: (o) => {
      const e = [];

      if (!str(o.bluf)) {
        e.push("bluf is empty");
      }

      exact(o.key_points, 4, "key_points", e);
      exact(o.risks, 3, "risks", e);
      exact(o.recommendations, 3, "recommendations", e);

      return e;
    }
  },

  linkedin: {
    prompt: (tone) => `
Create a professional LinkedIn post.

Tone: ${tone}

Return exactly this JSON shape:

{
  "hook": "",
  "body": "",
  "hashtags": ["#a", "#b", "#c", "#d"],
  "cta": ""
}

Rules:
- hook: 1-2 strong sentences.
- body: 2-4 short paragraphs.
- hashtags: EXACTLY 4.
- Every hashtag must start with #.
- cta: one clear call to action.
- Use only information from the Content Brief.
`,
    normalize: (o) => ({
      hook: clean(o.hook),
      body: clean(o.body),
      hashtags: toStrArr(o.hashtags)
        .map(
          (h) =>
            "#" +
            h.replace(/^#+/, "").replace(/\s+/g, "")
        )
        .slice(0, 4),
      cta: clean(o.cta)
    }),
    validate: (o) => {
      const e = [];

      ["hook", "body", "cta"].forEach((k) => {
        if (!str(o[k])) {
          e.push(`${k} is empty`);
        }
      });

      exact(o.hashtags, 4, "hashtags", e);

      return e;
    }
  },

  twitter: {
    prompt: () => `
Create a Twitter/X thread.

Return exactly this JSON shape:

{
  "tweets": [
    {
      "id": 1,
      "text": ""
    },
    {
      "id": 2,
      "text": ""
    },
    {
      "id": 3,
      "text": ""
    }
  ],
  "is_thread": true
}

Rules:
- EXACTLY 3 tweets.
- Each tweet must be under 260 characters.
- Tweet 1 introduces the topic.
- Tweet 2 explains key facts.
- Tweet 3 gives the takeaway.
- Use only information from the Content Brief.
`,
    normalize: (o) => ({
      tweets: (Array.isArray(o.tweets) ? o.tweets : [])
        .map((t) =>
          clean(
            typeof t === "string"
              ? t
              : t?.text
          )
        )
        .filter(Boolean)
        .slice(0, 3)
        .map((text, i) => ({
          id: i + 1,
          text: trimTo(text, 280)
        })),
      is_thread: true
    }),
    validate: (o) => {
      const e = [];

      exact(o.tweets, 3, "tweets", e);

      return e;
    }
  },

  advisory: {
    prompt: () => `
Create a cybersecurity advisory based only on the source.

Return exactly this JSON shape:

{
  "title": "",
  "severity": "High",
  "summary": "",
  "affected_systems": ["", ""],
  "impact": "",
  "mitigation": ["", "", ""],
  "references": []
}

Rules:
- severity must be Low, Medium, High or Critical.
- affected_systems must contain at least 2 source-supported items.
- mitigation must contain EXACTLY 3 actionable items.
- references should contain source-related references when available.
- Do not invent CVEs, URLs or vendors.
`,
    normalize: (o) => {
      const sev = clean(o.severity).toLowerCase();

      const map = {
        low: "Low",
        medium: "Medium",
        high: "High",
        critical: "Critical"
      };

      return {
        title: clean(o.title),
        severity: map[sev] || "",
        summary: clean(o.summary),
        affected_systems: toStrArr(o.affected_systems),
        impact: clean(o.impact),
        mitigation: toStrArr(o.mitigation).slice(0, 3),
        references: toStrArr(o.references)
      };
    },
    validate: (o) => {
      const e = [];

      ["title", "summary", "impact"].forEach((k) => {
        if (!str(o[k])) {
          e.push(`${k} is empty`);
        }
      });

      if (!o.severity) {
        e.push(
          "severity must be Low, Medium, High or Critical"
        );
      }

      if (o.affected_systems.length < 2) {
        e.push(
          "affected_systems needs at least 2 items"
        );
      }

      exact(o.mitigation, 3, "mitigation", e);

      return e;
    }
  },

  video: {
    prompt: () => `
Create a professional 5-scene video storyboard.

Return exactly this JSON shape:

{
  "scenes": [
    {
      "scene_number": 1,
      "title": "",
      "description": "",
      "narration": "",
      "visual": ""
    },
    {
      "scene_number": 2,
      "title": "",
      "description": "",
      "narration": "",
      "visual": ""
    },
    {
      "scene_number": 3,
      "title": "",
      "description": "",
      "narration": "",
      "visual": ""
    },
    {
      "scene_number": 4,
      "title": "",
      "description": "",
      "narration": "",
      "visual": ""
    },
    {
      "scene_number": 5,
      "title": "",
      "description": "",
      "narration": "",
      "visual": ""
    }
  ]
}

Rules:
- EXACTLY 5 scenes.
- scene_number must be 1 to 5.
- Every scene must have a title.
- Every scene must have a description.
- Every scene must have 2-3 narration sentences.
- Every scene must have concrete visual direction.
- Use only information from the Content Brief.
`,
    normalize: (o) => ({
      scenes: (
        Array.isArray(o.scenes || o.storyboard)
          ? o.scenes || o.storyboard
          : []
      )
        .slice(0, 5)
        .map((s, i) => ({
          scene_number: i + 1,
          title: clean(s?.title),
          description: clean(s?.description),
          narration: clean(
            s?.narration || s?.dialogue
          ),
          visual: clean(
            s?.visual || s?.visual_cue
          )
        }))
    }),
    validate: (o) => {
      const e = [];

      exact(o.scenes, 5, "scenes", e);

      (o.scenes || []).forEach((s) => {
        ["title", "description", "narration", "visual"].forEach(
          (k) => {
            if (!str(s[k])) {
              e.push(
                `scene ${s.scene_number}: ${k} is empty`
              );
            }
          }
        );
      });

      return e;
    },
    finalize: (o) => {
      const narration = o.scenes
        .map((s) => s.narration)
        .join("\n\n");

      const script = o.scenes
        .map(
          (s) =>
            `SCENE ${s.scene_number}: ${s.title}\nVISUAL: ${s.visual}\nVOICEOVER: ${s.narration}`
        )
        .join("\n\n");

      const sentences = narration
        .split(/(?<=[.!?])\s+/)
        .map((x) => x.trim())
        .filter(Boolean);

      const subtitles = sentences
        .map((s, i) => `${i + 1}\n${s}`)
        .join("\n\n");

      return {
        script,
        storyboard: o.scenes,
        scenes: o.scenes,
        narration,
        subtitles,
        visual_recommendations: o.scenes.map(
          (s) => ({
            title: s.title,
            description: s.visual
          })
        )
      };
    }
  },

  infographic: {
    prompt: () => `
Create professional infographic content and layout guidance.

Return exactly this JSON shape:

{
  "headline": "",
  "key_messages": [
    "",
    "",
    "",
    "",
    ""
  ],
  "sections": [
    {
      "title": "",
      "description": ""
    },
    {
      "title": "",
      "description": ""
    },
    {
      "title": "",
      "description": ""
    },
    {
      "title": "",
      "description": ""
    }
  ],
  "layout_recommendation": "",
  "color_icon_suggestions": [
    "",
    "",
    "",
    ""
  ]
}

STRICT RULES:

- headline must contain one clear main headline.
- key_messages MUST contain EXACTLY 5 items.
- sections MUST contain EXACTLY 4 objects.
- Every section MUST contain title and description.
- layout_recommendation MUST be a plain text string.
- Do NOT return layout_recommendation as an object.
- color_icon_suggestions MUST contain EXACTLY 4 strings.
- Do NOT put comments inside JSON.
- Do NOT use // comments.
- Do NOT use markdown.
- Do NOT use code fences.
- Use only information supported by the Content Brief.
- Do not invent statistics, dates, names or claims.

Return ONLY the JSON object.
`,
    normalize: (o) => {
      let keyMessages = toStrArr(
        o.key_messages
      );

      const sections = (
        Array.isArray(o.sections)
          ? o.sections
          : []
      )
        .slice(0, 4)
        .map((section) => ({
          title: clean(section?.title),
          description: clean(
            section?.description ||
            section?.content
          )
        }));

      let layoutRecommendation = "";

      if (
        typeof o.layout_recommendation ===
        "string"
      ) {
        layoutRecommendation = clean(
          o.layout_recommendation
        );
      } else if (
        o.layout_recommendation &&
        typeof o.layout_recommendation ===
          "object"
      ) {
        const layout =
          o.layout_recommendation;

        const type = clean(layout.type);

        const columns = Array.isArray(
          layout.columns
        )
          ? layout.columns
              .map((column) => {
                if (
                  typeof column ===
                  "string"
                ) {
                  return column;
                }

                return `${clean(
                  column?.width
                )} ${clean(
                  column?.content
                )}`.trim();
              })
              .filter(Boolean)
              .join(", ")
          : "";

        layoutRecommendation = [
          type
            ? `Layout: ${type}.`
            : "",
          columns
            ? `Sections: ${columns}.`
            : ""
        ]
          .filter(Boolean)
          .join(" ");
      }

      let colorSuggestions =
        toStrArr(
          o.color_icon_suggestions
        );

      if (colorSuggestions.length < 4) {
        colorSuggestions = [
          ...colorSuggestions,
          "Use a contrasting color for headings",
          "Use a warning icon for risks",
          "Use a technology icon for technical concepts",
          "Use a shield or check icon for mitigation"
        ];
      }

      if (keyMessages.length < 5) {
        const existing = new Set(
          keyMessages.map((item) =>
            item.toLowerCase()
          )
        );

        for (const section of sections) {
          const candidate = clean(
            section.description
          );

          if (
            candidate &&
            !existing.has(
              candidate.toLowerCase()
            )
          ) {
            keyMessages.push(candidate);
            existing.add(
              candidate.toLowerCase()
            );
          }

          if (keyMessages.length === 5) {
            break;
          }
        }
      }

      if (
        keyMessages.length < 5 &&
        str(o.headline)
      ) {
        keyMessages.push(
          `The infographic highlights the key aspects of ${clean(
            o.headline
          )}.`
        );
      }

      return {
        headline: clean(o.headline),
        key_messages:
          keyMessages.slice(0, 5),
        sections,
        layout_recommendation:
          layoutRecommendation,
        color_icon_suggestions:
          colorSuggestions.slice(0, 4)
      };
    },
    validate: (o) => {
      const e = [];

      if (!str(o.headline)) {
        e.push("headline is empty");
      }

      exact(
        o.key_messages,
        5,
        "key_messages",
        e
      );

      exact(
        o.sections,
        4,
        "sections",
        e
      );

      o.sections.forEach(
        (section, index) => {
          if (!str(section.title)) {
            e.push(
              `section ${index + 1}: title is empty`
            );
          }

          if (!str(section.description)) {
            e.push(
              `section ${index + 1}: description is empty`
            );
          }
        }
      );

      if (
        !str(o.layout_recommendation)
      ) {
        e.push(
          "layout_recommendation is empty"
        );
      }

      exact(
        o.color_icon_suggestions,
        4,
        "color_icon_suggestions",
        e
      );

      return e;
    }
  },

  presentation: {
    prompt: () => `
Create a professional 5-slide presentation.

Return exactly this JSON shape:

{
  "slides": [
    {
      "title": "",
      "bullets": [
        "",
        "",
        "",
        ""
      ],
      "speaker_notes": ""
    }
  ]
}

Rules:
- EXACTLY 5 slides.
- Every slide must have a non-empty title.
- Every slide must contain EXACTLY 4 concise bullets.
- Every slide must contain speaker_notes.
- speaker_notes must contain 2-4 complete sentences.
- Speaker notes must explain what the presenter should say.
- Speaker notes must not be simple numbers.
- Slide 1: introduction and context.
- Slide 2: important facts or how it works.
- Slide 3: risks, impact or challenges.
- Slide 4: mitigation, response or recommendations.
- Slide 5: conclusion and key takeaways.
- Use only information from the Content Brief.
`,
    normalize: (o) => ({
      slides: (
        Array.isArray(o.slides)
          ? o.slides
          : []
      )
        .slice(0, 5)
        .map((s) => ({
          title: clean(s?.title),
          bullets: toStrArr(
            s?.bullets
          ).slice(0, 4),
          speaker_notes: clean(
            s?.speaker_notes ||
            s?.notes
          )
        }))
    }),
    validate: (o) => {
      const e = [];

      exact(
        o.slides,
        5,
        "slides",
        e
      );

      o.slides.forEach(
        (s, i) => {
          if (!str(s.title)) {
            e.push(
              `slide ${i + 1}: title is empty`
            );
          }

          if (
            s.bullets.length !== 4
          ) {
            e.push(
              `slide ${i + 1}: needs exactly 4 bullets (got ${s.bullets.length})`
            );
          }

          if (!str(s.speaker_notes)) {
            e.push(
              `slide ${i + 1}: speaker_notes is empty`
            );
          }
        }
      );

      return e;
    }
  }
};

const ALIASES = {
  twitter_x: "twitter",
  x: "twitter",
  "executive summary":
    "executive_summary"
};

const generateBrief = async (
  text,
  language = "English"
) => {

  const languageInstruction =
    language.toLowerCase() === "hindi"
      ? `
OUTPUT LANGUAGE: Hindi

Write the title, summary, key facts and intent in natural Hindi.
Keep technical terms, company names, product names and proper nouns in English where appropriate.
`
      : language.toLowerCase() === "hinglish"
      ? `
OUTPUT LANGUAGE: Hinglish

Use natural Hindi-English mixed language.
Keep technical terms, company names, product names and proper nouns in English.
`
      : `
OUTPUT LANGUAGE: English

Write the complete content in clear natural English.
`;

  const base = `
Analyze this source.

${languageInstruction}

Return exactly this JSON shape:

{
  "title": "",
  "summary": "",
  "key_facts": [
    "",
    "",
    "",
    "",
    "",
    ""
  ],
  "intent": ""
}

Rules:
- title: short and specific.
- summary: 2-3 sentences.
- key_facts: 6 distinct facts taken ONLY from the source.
- intent: one sentence.
- Do not invent facts.
- Do not translate proper nouns unnecessarily.

Source:

${String(text).substring(0, 8000)}
`;

  let feedback = "";

  for (
    let i = 1;
    i <= MAX_ATTEMPTS;
    i++
  ) {
    try {

      const raw = await generateFromLLM(
        base + feedback,
        {
          language,
          maxTokens: 1800
        }
      );

      const o = parseLLMJson(raw);

      const brief = {
        title: clean(o.title),
        summary: clean(o.summary),
        key_facts: toStrArr(o.key_facts),
        intent: clean(o.intent)
      };

      const errs = [];

      if (!str(brief.title)) {
        errs.push("title empty");
      }

      if (!str(brief.summary)) {
        errs.push("summary empty");
      }

      if (brief.key_facts.length < 4) {
        errs.push(
          "key_facts needs at least 4 items"
        );
      }

      if (!str(brief.intent)) {
        errs.push("intent empty");
      }

      if (!errs.length) {
        return brief;
      }

      feedback = `
Your previous answer was rejected:

- ${errs.join("\n- ")}

Return the full corrected JSON.

Language must remain: ${language}
`;

    } catch (e) {

      feedback = `
Your previous answer was invalid.

${e.message}

Return ONLY valid JSON.
Language must remain: ${language}
`;
    }
  }

  throw new Error(
    "Could not generate a valid content brief"
  );
};

const generateOutput = async (
  rawType,
  brief,
  tone = "Professional",
  language = "English"
) => {

  const type =
    ALIASES[rawType] || rawType;

  const spec = SPECS[type];

  if (!spec) {
    throw new Error(
      `Unsupported output type: ${rawType}`
    );
  }

  const languageInstruction =
    language.toLowerCase() === "hindi"
      ? `
OUTPUT LANGUAGE: Hindi

Generate the complete output in natural Hindi.

Rules:
- Use Hindi for normal content.
- Keep technical terms in English where appropriate.
- Keep company names, product names, URLs and proper nouns unchanged.
`
      : language.toLowerCase() === "hinglish"
      ? `
OUTPUT LANGUAGE: Hinglish

Generate the output in natural Hindi-English mixed language.

Rules:
- Use Hindi + English naturally.
- Keep technical terms in English.
- Keep company names, product names, URLs and proper nouns unchanged.
`
      : `
OUTPUT LANGUAGE: English

Generate the complete output in clear natural English.
`;

  const base = `
You are NITOGEN, a strict content transformation engine.

Use ONLY the Content Brief.

Never invent:
- facts
- names
- dates
- statistics
- quotes
- URLs
- vendors
- CVEs

${languageInstruction}

Tone:
${tone}

Return ONLY one valid JSON object.

Do not use markdown.
Do not use code fences.
Do not add explanations outside JSON.

Content Brief:

${JSON.stringify(brief)}

${spec.prompt(tone)}
`;

  let feedback = "";
  let lastErrors = [];

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {

    try {

      const raw =
        await generateFromLLM(
          base + feedback,
          {
            language,

            maxTokens:
              type === "presentation" ||
              type === "video"
                ? 3500
                : 2500
          }
        );

      const normalized =
        spec.normalize(
          parseLLMJson(raw)
        );

      const errors =
        spec.validate(
          normalized
        );

      if (!errors.length) {

        return spec.finalize
          ? spec.finalize(normalized)
          : normalized;
      }

      lastErrors = errors;

      console.warn(
        `[${type}] attempt ${attempt} rejected:`,
        errors
      );

      feedback = `
Your previous answer was REJECTED for these reasons:

- ${errors.join("\n- ")}

Return the complete corrected JSON now.

Respect every count exactly.
Do not add markdown.
Do not add comments.

IMPORTANT:
Output language must remain:
${language}
`;

    } catch (e) {

      lastErrors = [
        e.message
      ];

      console.warn(
        `[${type}] attempt ${attempt} error:`,
        e.message
      );

      feedback = `
Your previous answer was invalid.

${e.message}

Return ONLY one valid JSON object.

Do not use markdown.
Do not use comments.

Output language must remain:
${language}
`;
    }
  }

  throw new Error(
    `${type} failed validation after ${MAX_ATTEMPTS} attempts: ${lastErrors.join(
      "; "
    )}`
  );
};

module.exports = {
  generateBrief,
  generateOutput,
  parseLLMJson
};