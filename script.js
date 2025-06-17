document.getElementById("downloadBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Processing...";

  try {
    // Access clipboard
    const clipboardItems = await navigator.clipboard.read();
    let imageBlob = null;

    // Find image in clipboard
    for (const item of clipboardItems) {
      for (const type of item.types) {
        if (type.startsWith("image/")) {
          imageBlob = await item.getType(type);
          break;
        }
      }
      if (imageBlob) break;
    }

    if (!imageBlob) {
      status.textContent = "No image found in clipboard.";
      return;
    }

    // Create image element for OCR
    const img = new Image();
    img.src = URL.createObjectURL(imageBlob);
    await new Promise((resolve) => (img.onload = resolve));

    // Perform OCR using Tesseract.js
    const {
      data: { text },
    } = await Tesseract.recognize(img.src, "eng");
    URL.revokeObjectURL(img.src);

    // Generate filename from text (1-3 words)
    const words = text
      .split(/\s+/)
      .filter((word) => word.length > 2 && /^[a-zA-Z]+$/.test(word));
    const meaningfulWords =
      words.slice(0, 3).join("-").toLowerCase() || "image";
    const filename = `${meaningfulWords}.jpeg`;

    // Convert to JPEG and download
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      status.textContent = `Image downloaded as ${filename}`;
    }, "image/jpeg");
  } catch (error) {
    console.error("Error:", error);
    status.textContent = "Error processing image. Please try again.";
  }
});
