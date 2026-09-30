const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");
const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const extractText = async (inputType, inputValue, filePath) => {
  try {
    switch (inputType) {
      case "url": {
        const response = await fetch(inputValue);

        if (!response.ok) {
          throw new Error(`URL request failed with status ${response.status}`);
        }

        const html = await response.text();

        const doc = new JSDOM(html, {
          url: inputValue,
        });

        const reader = new Readability(doc.window.document);
        const parsed = reader.parse();

        return parsed?.textContent?.trim() || "No content found in URL";
      }

      case "pdf": {
        if (!filePath) {
          throw new Error("File path missing");
        }

        const pdfBuffer = fs.readFileSync(filePath);

        let pdfParseFn;

        try {
          const imported = await import("pdf-parse");
          pdfParseFn = imported.default || imported;
        } catch (e) {
          const reqLib = require("pdf-parse");
          pdfParseFn =
            typeof reqLib === "function" ? reqLib : reqLib.default;
        }

        if (typeof pdfParseFn !== "function") {
          throw new Error("pdf-parse is still not resolving as a function.");
        }

        const pdfData = await pdfParseFn(pdfBuffer);

        return pdfData.text.trim();
      }

      case "docx": {
        if (!filePath) {
          throw new Error("File path missing");
        }

        const docxData = await mammoth.extractRawText({
          path: filePath,
        });

        return docxData.value.trim();
      }

      case "image": {
        if (!filePath) {
          throw new Error("File path missing");
        }

        const ocrResult = await Tesseract.recognize(
          filePath,
          "eng"
        );

        return ocrResult.data.text.trim();
      }

      case "video": {
        if (!filePath) {
          throw new Error("File path missing");
        }

        // Temporary audio file
        const audioPath = `${filePath}.wav`;

        try {
          /*
           * Video
           *   ↓
           * FFmpeg
           *   ↓
           * 16kHz mono WAV
           *   ↓
           * Whisper
           *   ↓
           * Transcript
           */

          await execFileAsync("ffmpeg", [
            "-y",
            "-i",
            filePath,
            "-vn",
            "-ac",
            "1",
            "-ar",
            "16000",
            audioPath,
          ]);

          const whisperModel =
            process.env.WHISPER_MODEL || "base";

          await execFileAsync(
            "whisper",
            [
              audioPath,
              "--model",
              whisperModel,
              "--output_format",
              "txt",
              "--output_dir",
              path.dirname(audioPath),
            ],
            {
              maxBuffer: 20 * 1024 * 1024,
            }
          );

          const txtPath = audioPath.replace(
            /\.wav$/i,
            ".txt"
          );

          if (fs.existsSync(txtPath)) {
            return fs
              .readFileSync(txtPath, "utf8")
              .trim();
          }

          return "";
        } finally {
          // Cleanup temporary files
          const temporaryFiles = [
            audioPath,
            audioPath.replace(/\.wav$/i, ".txt"),
          ];

          for (const tempFile of temporaryFiles) {
            try {
              if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
              }
            } catch (_) {}
          }
        }
      }

      case "text":
      default:
        return inputValue;
    }
  } catch (error) {
    console.error(
      `Ingestion Error (${inputType}):`,
      error
    );

    throw new Error(
      `Failed to extract text from ${inputType}`
    );
  }
};

module.exports = {
  extractText,
};