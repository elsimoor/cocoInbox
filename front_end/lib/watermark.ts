// Basic visible watermark for images using Canvas

export async function watermarkImage(file: File, text: string): Promise<Blob> {
  const imgUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(imgUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');

    // draw source image
    ctx.drawImage(img, 0, 0);

    // watermark style
    const fontSize = Math.max(14, Math.floor(Math.min(canvas.width, canvas.height) * 0.035));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    const padding = Math.max(10, Math.floor(fontSize * 0.6));

    // shadow for contrast
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(text, canvas.width - padding, canvas.height - padding);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))), 'image/png', 0.95);
    });
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

