const fs = require("fs");
const path = require("path");

const Project = require("../models/Project");
const Output = require("../models/Output");

const {
  generateBrief,
  generateOutput
} = require("../services/outputGenerator");

const {
  extractText
} = require("../services/ingestionService");

const PptxGenJS = require("pptxgenjs");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// ==================================================
// OUTPUT SAFETY / NORMALIZATION
// ==================================================

const cleanText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};


const toStringArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        return String(
          item.text ||
          item.description ||
          item.title ||
          ""
        ).trim();
      }

      return "";
    })
    .filter(Boolean);
};


// ==================================================
// VIDEO NORMALIZER
// ==================================================

const normalizeVideoOutput = (data) => {

  let scenes = [];

  if (Array.isArray(data?.scenes)) {
    scenes = data.scenes;
  } else if (Array.isArray(data?.storyboard)) {
    scenes = data.storyboard;
  }

  scenes = scenes.slice(0, 5);


  while (scenes.length < 5) {
    scenes.push({
      scene_number: scenes.length + 1,
      title: `Scene ${scenes.length + 1}`,
      description: "",
      narration: "",
      visual: ""
    });
  }


  scenes = scenes.map((scene, index) => {

    const description =
      cleanText(scene?.description) ||
      cleanText(scene?.visual) ||
      "This scene explains a key point from the source.";


    const narration =
      cleanText(scene?.narration) ||
      cleanText(scene?.dialogue) ||
      description;


    const visual =
      cleanText(scene?.visual) ||
      cleanText(scene?.visual_cue) ||
      description;


    return {
      scene_number: index + 1,

      title:
        cleanText(scene?.title) ||
        `Scene ${index + 1}`,

      description,

      narration,

      visual
    };
  });


  const narration = scenes
    .map((scene) => scene.narration)
    .join("\n\n");


  const script = scenes
    .map(
      (scene) =>
        `SCENE ${scene.scene_number}: ${scene.title}\n` +
        `VISUAL: ${scene.visual}\n` +
        `VOICEOVER: ${scene.narration}`
    )
    .join("\n\n--------------------\n\n");


  const subtitles = scenes
    .map(
      (scene, index) =>
        `${index + 1}\n${scene.narration}`
    )
    .join("\n\n");


  const visual_recommendations =
    scenes.map((scene) => ({
      title: scene.title,
      description: scene.visual
    }));


  return {
    ...data,

    script,

    storyboard: scenes,

    scenes,

    narration,

    subtitles,

    visual_recommendations
  };
};


// ==================================================
// PRESENTATION NORMALIZER
// ==================================================

const normalizePresentationOutput = (data) => {

  let slides = Array.isArray(data?.slides)
    ? data.slides.slice(0, 5)
    : [];


  while (slides.length < 5) {
    slides.push({
      title: `Slide ${slides.length + 1}`,
      bullets: [],
      speaker_notes: ""
    });
  }


  slides = slides.map((slide, index) => {

    let bullets = toStringArray(
      slide?.bullets
    );


    while (bullets.length < 4) {
      bullets.push(
        "Additional source-based point."
      );
    }


    bullets = bullets.slice(0, 4);


    const speaker_notes =
      cleanText(slide?.speaker_notes) ||
      cleanText(slide?.notes) ||
      "This slide presents information derived from the source. " +
      "The presenter should explain the main points shown here. " +
      "The discussion should remain focused on the source material.";


    return {
      ...slide,

      title:
        cleanText(slide?.title) ||
        `Slide ${index + 1}`,

      bullets,

      speaker_notes
    };
  });


  return {
    ...data,
    slides
  };
};


// ==================================================
// INFOGRAPHIC NORMALIZER
// ==================================================

const normalizeInfographicOutput = (data) => {

  const headline =
    cleanText(data?.headline) ||
    "Key Information Overview";


  let key_messages =
    toStringArray(
      data?.key_messages
    );


  while (key_messages.length < 5) {
    key_messages.push(
      `Key source insight ${key_messages.length + 1}`
    );
  }


  key_messages =
    key_messages.slice(0, 5);


  let sections =
    Array.isArray(data?.sections)
      ? data.sections.slice(0, 4)
      : [];


  sections = sections.map(
    (section, index) => ({
      title:
        cleanText(section?.title) ||
        `Section ${index + 1}`,

      description:
        cleanText(section?.description) ||
        key_messages[index] ||
        "Relevant information from the source."
    })
  );


  while (sections.length < 4) {

    const index =
      sections.length;


    sections.push({
      title: `Section ${index + 1}`,

      description:
        key_messages[index] ||
        "Relevant information from the source."
    });
  }


  let color_icon_suggestions =
    toStringArray(
      data?.color_icon_suggestions
    );


  const defaults = [
    "Use a clean high-contrast visual hierarchy.",
    "Use simple icons representing the section topic.",
    "Keep headings visually distinct from body text.",
    "Use consistent spacing and alignment."
  ];


  while (
    color_icon_suggestions.length < 4
  ) {

    color_icon_suggestions.push(
      defaults[color_icon_suggestions.length]
    );
  }


  return {

    ...data,

    headline,

    key_messages,

    sections,

    layout_recommendation:
      cleanText(
        data?.layout_recommendation
      ) ||
      "Place the headline at the top, followed by key messages and supporting sections from top to bottom.",

    color_icon_suggestions:
      color_icon_suggestions.slice(0, 4)
  };
};


// ==================================================
// GENERATE OUTPUT WITH RETRIES
// ==================================================

const generateOutputWithRetry = async (
  type,
  brief,
  tone,
  attempts = 2
) => {

  let lastError;


  for (
    let attempt = 1;
    attempt <= attempts;
    attempt++
  ) {

    try {

      console.log(
        `[${type}] generation attempt ${attempt}/${attempts}`
      );


      const content =
        await generateOutput(
          type,
          brief,
          tone
        );


      if (!content) {
        throw new Error(
          "LLM returned empty output"
        );
      }


      return content;

    } catch (error) {

      lastError = error;


      console.error(
        `[${type}] attempt ${attempt} failed:`,
        error.message
      );
    }
  }


  throw (
    lastError ||
    new Error(
      `${type} generation failed`
    )
  );
};


// ==================================================
// GENERATE PRESENTATION
// ==================================================

const generatePresentation = async (
  slides,
  projectId
) => {

  if (
    !Array.isArray(slides) ||
    !slides.length
  ) {
    throw new Error(
      "No slides generated"
    );
  }


  const pptx =
    new PptxGenJS();


  pptx.layout =
    "LAYOUT_WIDE";

  pptx.author =
    "NITOGEN";

  pptx.title =
    "AI Generated Presentation";


  for (const item of slides) {

    const slide =
      pptx.addSlide();


    // TITLE

    slide.addText(
      String(
        item.title ||
        "Untitled"
      ),
      {
        x: 0.6,
        y: 0.5,
        w: 12,
        h: 0.7,
        fontSize: 28,
        bold: true
      }
    );


    // BULLETS

    const bullets =
      Array.isArray(item.bullets)
        ? item.bullets
            .map(String)
            .join("\n")
        : "";


    slide.addText(
      bullets,
      {
        x: 0.8,
        y: 1.5,
        w: 11.5,
        h: 4.8,
        fontSize: 20,
        valign: "top",
        bullet: {
          type: "ul"
        }
      }
    );


    // SPEAKER NOTES

    slide.addNotes(
      String(
        item.speaker_notes ||
        "This slide presents information derived from the source. The presenter should explain the key points shown on the slide."
      )
    );
  }


  // PRESENTATION FOLDER

  const folder =
    path.join(
      __dirname,
      "../uploads/presentations"
    );


  if (!fs.existsSync(folder)) {

    fs.mkdirSync(
      folder,
      {
        recursive: true
      }
    );
  }


  const fileName =
    `presentation-${projectId}.pptx`;


  const filePath =
    path.join(
      folder,
      fileName
    );


  // CREATE PPTX

  await pptx.writeFile({
    fileName: filePath
  });


  // UPLOAD CLOUDINARY

 const isDemoMode =
  String(process.env.DEMO_MODE).toLowerCase() === "true";

if (isDemoMode) {
  const generatedFolder = path.join(
    __dirname,
    "..",
    process.env.GENERATED_FILES_DIR || "generated"
  );

  if (!fs.existsSync(generatedFolder)) {
    fs.mkdirSync(generatedFolder, {
      recursive: true,
    });
  }

  const generatedPath = path.join(
    generatedFolder,
    fileName
  );

  fs.copyFileSync(
    filePath,
    generatedPath
  );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  console.log(
    `Demo mode: presentation saved locally -> ${generatedPath}`
  );

  return {
    url: `/api/projects/files/${fileName}`,
    fileName,
  };
}

// NORMAL CLOUDINARY MODE

const uploaded = await cloudinary.uploader.upload(
  filePath,
  {
    resource_type: "raw",
    folder: "nitogen/presentations",
    public_id: `presentation-${projectId}`,
    overwrite: true,
  }
);

if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}

return {
  url: uploaded.secure_url,
  fileName,
};

  // DELETE LOCAL FILE

  if (
    fs.existsSync(filePath)
  ) {
    fs.unlinkSync(filePath);
  }


  return {
    url:
      uploaded.secure_url,

    fileName
  };
};


// ==================================================
// CREATE PROJECT
// ==================================================

const createProject = async (
  req,
  res
) => {

  try {

    const {
      title,
      inputType,
      inputValue,
      outputTypes,
      params
    } = req.body;


    const userId =
      req.user._id;


    const filePath =
      req.file
        ? req.file.path
        : null;


    // ==================================================
    // OUTPUT TYPES
    // ==================================================

    let requestedOutputs = [];


    try {

      if (
        Array.isArray(outputTypes)
      ) {

        requestedOutputs =
          outputTypes;

      } else if (
        typeof outputTypes ===
        "string"
      ) {

        const value =
          outputTypes.trim();


        if (
          value.startsWith("[")
        ) {

          const parsed =
            JSON.parse(value);


          requestedOutputs =
            Array.isArray(parsed)
              ? parsed
              : [parsed];

        } else {

          requestedOutputs =
            value.split(",");
        }
      }


      requestedOutputs =
        requestedOutputs

          .map((item) =>
            String(item)
              .replace(
                /["'*\\]/g,
                ""
              )
              .trim()
              .toLowerCase()
          )

          .filter(Boolean);


    } catch {

      requestedOutputs = [];
    }


    // ==================================================
    // PARAMS
    // ==================================================

    let parsedParams = {};


    try {

      if (
        params &&
        typeof params ===
        "object"
      ) {

        parsedParams =
          params;

      } else if (
        typeof params ===
        "string" &&
        params.trim()
      ) {

        parsedParams =
          JSON.parse(params);
      }

    } catch {

      parsedParams = {};
    }


    // ==================================================
    // EXTRACT SOURCE TEXT
    // ==================================================

    let extractedText =
      await extractText(
        inputType,
        inputValue,
        filePath
      );


    extractedText =
      String(
        extractedText || ""
      ).trim();


    // DELETE TEMP FILE

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {

      fs.unlinkSync(
        filePath
      );
    }


    // ==================================================
    // VALIDATE SOURCE
    // ==================================================

    if (
      extractedText.length < 200
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Source content too short or could not be extracted"

      });
    }


    // ==================================================
    // CREATE PROJECT
    // ==================================================

    const project =
      await Project.create({

        userId,

        title,

        sourceData: {
          inputType,
          extractedText
        },

        params:
          parsedParams,

        status:
          "processing"

      });


    // RESPONSE IMMEDIATELY

    res.status(201).json({

      success: true,

      message:
        "Processing started",

      projectId:
        project._id

    });


    // ==================================================
    // BACKGROUND PROCESSING
    // ==================================================

    let brief;


    try {

      brief =
        await generateBrief(
          extractedText
        );


      project.brief =
        brief;


      await project.save();


    } catch (error) {

      console.error(
        "Brief Generation Failed:",
        error
      );


      project.status =
        "failed";


      await project.save();


      return;
    }


    // ==================================================
    // GENERATE OUTPUTS
    // ==================================================

    const tone =
      parsedParams.tone ||
      "Professional";


    let failedCount = 0;


    for (
      const type
      of requestedOutputs
    ) {

      const output =
        await Output.create({

          projectId:
            project._id,

          outputType:
            type,

          status:
            "generating"

        });


      try {

        // ==============================================
        // GENERATE
        // ==============================================

        let content =
          await generateOutputWithRetry(
            type,
            brief,
            tone,
            2
          );


        // ==============================================
        // VIDEO
        // ==============================================

        if (
          type === "video"
        ) {

          content =
            normalizeVideoOutput(
              content
            );
        }


        // ==============================================
        // PRESENTATION
        // ==============================================

        if (
          type === "presentation"
        ) {

          content =
            normalizePresentationOutput(
              content
            );
        }


        // ==============================================
        // INFOGRAPHIC
        // ==============================================

        if (
          type === "infographic"
        ) {

          content =
            normalizeInfographicOutput(
              content
            );
        }


        // ==============================================
        // SAVE CONTENT
        // ==============================================

        output.content =
          content;


        // ==============================================
        // PRESENTATION PPTX
        // ==============================================

        if (
          type === "presentation"
        ) {

          const presentation =
            await generatePresentation(
              content.slides,
              project._id
            );


          output.content.downloadUrl =
            presentation.url;


          output.content.fileName =
            presentation.fileName;
        }


        // ==============================================
        // DONE
        // ==============================================

        output.status =
          "done";


        await output.save();


      } catch (error) {

        failedCount++;


        console.error(
          `${type} Generation Failed:`,
          error
        );


        output.status =
          "failed";


        output.errorLog =
          error.message;


        await output.save();
      }
    }


    // ==================================================
    // PROJECT STATUS
    // ==================================================

    project.status =
      requestedOutputs.length &&
      failedCount ===
        requestedOutputs.length

        ? "failed"

        : "completed";


    await project.save();


  } catch (error) {

    console.error(
      "Project Error:",
      error
    );


    if (
      !res.headersSent
    ) {

      res.status(500).json({

        success: false,

        message:
          "Server error"

      });
    }
  }
};


// ==================================================
// GET PROJECT DETAILS
// ==================================================

const getProjectDetails =
  async (
    req,
    res
  ) => {

    try {

      const project =
        await Project.findById(
          req.params.id
        );


      if (!project) {

        return res.status(404).json({

          success: false,

          message:
            "Project not found"

        });
      }


      const outputs =
        await Output.find({

          projectId:
            project._id

        });


      res.status(200).json({

        success: true,

        data: {
          project,
          outputs
        }

      });


    } catch (error) {

      console.error(
        "Fetch Project Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Server error"

      });
    }
  };


// ==================================================
// GET PROJECTS
// ==================================================

const getProjects =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        req.user._id;


      const {
        search,
        status
      } = req.query;


      const query = {
        userId
      };


      if (
        status &&
        status !== "all"
      ) {

        query.status =
          status;
      }


      if (search) {

        query.title = {
          $regex:
            search,

          $options:
            "i"
        };
      }


      const projects =
        await Project.find(
          query
        ).sort({
          createdAt:
            -1
        });


      res.status(200).json({

        success: true,

        data:
          projects

      });


    } catch (error) {

      console.error(
        "Fetch Projects Error:",
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Server error"

      });
    }
  };
const downloadGeneratedFile = async (req, res) => {
  try {
    const fileName = path.basename(req.params.fileName);

    const generatedFolder = path.join(
      __dirname,
      "..",
      process.env.GENERATED_FILES_DIR || "generated"
    );

    const filePath = path.join(
      generatedFolder,
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Generated file not found",
      });
    }

    return res.download(
      filePath,
      fileName
    );

  } catch (error) {
    console.error(
      "Generated file download error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to download generated file",
    });
  }
};

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  createProject,
  getProjectDetails,
  getProjects,
  downloadGeneratedFile,
};