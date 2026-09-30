const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const cloudinary = require("../config/cloudinary");

const generateDocumentPDF = async (
  contentString,
  title
) => {
  const fileName = `output-${Date.now()}.pdf`;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      bufferPages: true,
    });

    const chunks = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);

        const isDemoMode =
          String(process.env.DEMO_MODE).toLowerCase() ===
          "true";

        // ==========================================
        // DEMO MODE - SAVE LOCALLY
        // ==========================================

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

          const filePath = path.join(
            generatedFolder,
            fileName
          );

          fs.writeFileSync(
            filePath,
            pdfBuffer
          );

          console.log(
            `Demo mode: PDF saved locally -> ${filePath}`
          );

          return resolve({
            reportUrl: `/api/projects/files/${fileName}`,
            fileName,
          });
        }

        // ==========================================
        // NORMAL MODE - CLOUDINARY
        // ==========================================

        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder:
                "gen-ai-platform/exports",
              public_id:
                fileName.replace(".pdf", ""),
              resource_type: "raw",
            },
            (error, result) => {
              if (error) {
                return reject(error);
              }

              resolve({
                reportUrl:
                  result.secure_url,
                fileName,
              });
            }
          );

        const stream = new PassThrough();

        stream.end(pdfBuffer);
        stream.pipe(uploadStream);

      } catch (error) {
        reject(error);
      }
    });

    doc.on("error", reject);

    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(title, {
        align: "center",
      });

    doc.moveDown(1);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(contentString, {
        align: "left",
        lineGap: 4,
      });

    doc.end();
  });
};

module.exports = {
  generateDocumentPDF,
};