import { useState } from "react";
import Tesseract from "tesseract.js";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// import { uploadToS3 } from "../../utils/amazoncred";
// import imageUploader from "../../utils/uploadDoc";

import axios from "axios";

GlobalWorkerOptions.workerPort = new pdfjsWorker();


const OCR = ({ setInitialtext }) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const [keyPoint, setKeypoint] = useState();

  const handleFileChange = async (e) => {
    try {
      
      const file = e.target.files[0];
  
      if (!file) return;
  
      let { data } = await axios.post("http://localhost:5000/upload", {
        ContentType: file.type,
        filename: file.name,
      });

      console.log(data);
      
  
      
      let resp = await axios.put(data.signedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
  
      console.log(resp);
  
      const fileType = file.type;
      setIsProcessing(true);
      setError("");
      setProgress(0);
      setPreviewUrl("");
  
      if (fileType === "application/pdf") {
        await handlePDF(file);
      } else if (fileType.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        await handleImage(file);
      } else {
        setError("Unsupported file type. Please upload an image or PDF.");
        setIsProcessing(false);
      }
    } catch (error) {
      console.log("error",error);
      
    }
  };

  const handleImage = async (file) => {
    const imageUrl = URL.createObjectURL(file);

    try {
      const result = await Tesseract.recognize(imageUrl, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.floor(m.progress * 100));
          }
        },
      });

      const extractedText = result.data.text;
      console.log("Extracted Text:", extractedText);
      await sendToChatAPI(extractedText);
    } catch (err) {
      console.error("OCR Error:", err);
      setError("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePDF = async (file) => {
    try {
      const pdfData = await file.arrayBuffer();
      const pdf = await getDocument({ data: pdfData }).promise;
      const numPages = pdf.numPages;

      let fullText = "";
      const previewImages = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        const dataUrl = canvas.toDataURL();
        previewImages.push(dataUrl);

        const result = await Tesseract.recognize(dataUrl, "eng", {
          logger: (m) => {
            if (m.status === "recognizing text") {
              const currentProgress = Math.floor(
                ((pageNum - 1 + m.progress) / numPages) * 100
              );
              setProgress(currentProgress);
            }
          },
        });

        fullText += `--- Page ${pageNum} ---\n${result.data.text}\n\n`;
      }

      setPreviewUrl(previewImages[0]);
      console.log("Extracted Text:", fullText || "No text recognized.");
      await sendToChatAPI(fullText);
    } catch (err) {
      console.error("PDF OCR Error:", err);
      setError("Failed to process PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const sendToChatAPI = async (text) => {
    try {
      const mytext = `${text} `;
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [`${mytext} give me the key points from this`],
        }),
      });

      const result = await response.json();
      setKeypoint(result.reply);
      setInitialtext(mytext);
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to communicate with AI backend.");
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "auto", padding: 20 }}>
      <h2>📄 OCR - Image & PDF (Preview + Chat)</h2>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isProcessing && <p>🔍 Processing... {progress}%</p>}
      <div
        style={{
          display: "flex",
          flex: 1,
          textAlign: "left",
          justifyContent: "space-evenly",
        }}
      >
        {previewUrl && (
          <div style={{ marginTop: 20 }}>
            <p>
              <strong>Preview:</strong>
            </p>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: 400,
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}
        <div style={{ maxWidth: "50%" }}>
          <h2>Key points of Resume</h2>
          <div
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              border: "1px solid #fff",
              margin: "10px",
              padding: "10px",
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {keyPoint}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCR;
