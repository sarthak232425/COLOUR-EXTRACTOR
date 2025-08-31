// DOM elements
const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const magnifierCanvas = document.getElementById('magnifierCanvas');
const mCtx = magnifierCanvas.getContext('2d');
const savedColors = document.getElementById('savedColors');
const coordinates = document.getElementById('coordinates');
const colorPreview = document.getElementById('colorPreview');
const hexValue = document.getElementById('hexValue');
const rgbValue = document.getElementById('rgbValue');
const currentColor = document.getElementById('currentColor');
const clearAll = document.getElementById('clearAll');

let img = new Image();
let currentPixelData = null;
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Event listeners
imageUpload.addEventListener('change', handleImageUpload);

// Use appropriate events for mobile vs desktop
if (isMobile) {
  uploadedImage.addEventListener('touchmove', handleImageTouchMove, { passive: false });
  uploadedImage.addEventListener('touchend', handleImageTouchEnd);
} else {
  uploadedImage.addEventListener('mousemove', handleImageMouseMove);
  uploadedImage.addEventListener('click', handleImageClick);
}

clearAll.addEventListener('click', clearAllColors);

// Functions
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      img.onload = () => {
        uploadedImage.src = img.src;
        imageCanvas.width = img.width;
        imageCanvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function handleImageMouseMove(e) {
  if (!img.src) return;
  
  const rect = uploadedImage.getBoundingClientRect();
  const scaleX = img.width / rect.width;
  const scaleY = img.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);
  
  updateColorDisplay(x, y);
}

function handleImageTouchMove(e) {
  if (!img.src) return;
  e.preventDefault(); // Prevent scrolling on touch devices
  
  const touch = e.touches[0];
  const rect = uploadedImage.getBoundingClientRect();
  const scaleX = img.width / rect.width;
  const scaleY = img.height / rect.height;
  const x = Math.floor((touch.clientX - rect.left) * scaleX);
  const y = Math.floor((touch.clientY - rect.top) * scaleY);
  
  updateColorDisplay(x, y);
}

function handleImageTouchEnd(e) {
  if (!img.src) return;
  
  const touch = e.changedTouches[0];
  const rect = uploadedImage.getBoundingClientRect();
  const scaleX = img.width / rect.width;
  const scaleY = img.height / rect.height;
  const x = Math.floor((touch.clientX - rect.left) * scaleX);
  const y = Math.floor((touch.clientY - rect.top) * scaleY);
  
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
  const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  
  addColorBox(hex, rgb);
}

function handleImageClick(e) {
  if (!img.src) return;
  
  const rect = uploadedImage.getBoundingClientRect();
  const scaleX = img.width / rect.width;
  const scaleY = img.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);
  
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
  const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  
  addColorBox(hex, rgb);
}

function updateColorDisplay(x, y) {
  coordinates.textContent = `X: ${x}, Y: ${y}`;
  const zoom = 8;
  const size = 20;
  mCtx.imageSmoothingEnabled = false;
  mCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height);
  mCtx.drawImage(
    imageCanvas, 
    x - size/2, y - size/2, size, size,
    0, 0, magnifierCanvas.width, magnifierCanvas.height
  );
  mCtx.strokeStyle = "#8b5cf6";
  mCtx.lineWidth = 2;
  mCtx.strokeRect(
    magnifierCanvas.width/2 - zoom/2, 
    magnifierCanvas.height/2 - zoom/2, 
    zoom, 
    zoom
  );
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  currentPixelData = pixel;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
  const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  colorPreview.style.backgroundColor = hex;
  hexValue.textContent = hex;
  rgbValue.textContent = rgb;
  currentColor.style.display = 'block';
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x =>
    x.toString(16).
        padStart(2, "0")
  ).join("");
}

function addColorBox(hex, rgb) {
  // Remove the empty state if it exists
  if (savedColors.querySelector('.text-gray-500')) {
    savedColors.innerHTML = '';
  }

  const div = document.createElement('div');
  div.className = "color-swatch bg-dark-800 rounded-lg shadow-md p-3 flex flex-col";

  const colorHeader = document.createElement('div');
  colorHeader.className = "flex items-center justify-between mb-2";

  const timeStamp = document.createElement('span');
  timeStamp.className = "text-xs text-gray-400";
  timeStamp.textContent = new Date().toLocaleTimeString();

  colorHeader.appendChild(timeStamp);

  const swatch = document.createElement('div');
  swatch.className = "w-full h-16 rounded-md mb-2 shadow-inner border border-dark-700";
  swatch.style.backgroundColor = hex;

  const colorValues = document.createElement('div');
  colorValues.className = "mb-2";

  const hexText = document.createElement('div');
  hexText.textContent = hex;
  hexText.className = "font-mono text-xs mb-1";

  const rgbText = document.createElement('div');
  rgbText.textContent = rgb;
  rgbText.className = "font-mono text-xs text-gray-400";

  colorValues.appendChild(hexText);
  colorValues.appendChild(rgbText);

  const btnRow = document.createElement('div');
  btnRow.className = "flex gap-2 mt-auto";

  const copyHexBtn = document.createElement('button');
  copyHexBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>`;
  copyHexBtn.className = "flex-1 flex items-center justify-center py-1 bg-dark-700 rounded-md hover:bg-accent-600 transition-colors";
  copyHexBtn.title = "Copy HEX";
  copyHexBtn.onclick = () => {
    navigator.clipboard.writeText(hex);
    showTooltip(copyHexBtn, "Copied!");
  };

  const copyRgbBtn = document.createElement('button');
  copyRgbBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>`;
  copyRgbBtn.className = "flex-1 flex items-center justify-center py-1 bg-dark-700 rounded-md hover:bg-accent-600 transition-colors";
  copyRgbBtn.title = "Copy RGB";
  copyRgbBtn.onclick = () => {
    navigator.clipboard.writeText(rgb);
    showTooltip(copyRgbBtn, "Copied!");
  };

  const removeBtn = document.createElement('button');
  removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>`;
  removeBtn.className = "flex-1 flex items-center justify-center py-1 bg-dark-700 rounded-md hover:bg-red-600 transition-colors";
  removeBtn.title = "Remove";
  removeBtn.onclick = () => {
    div.classList.add("opacity-0", "transform", "scale-95");
    setTimeout(() => {
      div.remove();
      if (savedColors.children.length === 0) {
        showEmptyState();
      }
    }, 300);
  };

  btnRow.appendChild(copyHexBtn);
  btnRow.appendChild(copyRgbBtn);
  btnRow.appendChild(removeBtn);

  div.appendChild(colorHeader);
  div.appendChild(swatch);
  div.appendChild(colorValues);
  div.appendChild(btnRow);

  savedColors.appendChild(div);

  // Add animation for new element
  setTimeout(() => {
    div.classList.add("opacity-100");
  }, 10);
}

function showEmptyState() {
  savedColors.innerHTML = `
    <div class="text-center py-6 text-gray-500 rounded-lg bg-dark-800 border border-dashed border-dark-700 col-span-2 sm:col-span-3 md:col-span-4">
      <p class="text-sm">No colors saved yet</p>
      <p class="text-xs mt-1">Tap on your image to save colors</p>
    </div>
  `;
}

function clearAllColors() {
  if (savedColors.children.length === 0) return;

  if (confirm("Are you sure you want to clear all saved colors?")) {
    const children = Array.from(savedColors.children);
    children.forEach(child => {
      child.classList.add("opacity-0", "transform", "scale-95", "transition-all", "duration-300");
    });

    setTimeout(() => {
      savedColors.innerHTML = '';
      showEmptyState();
    }, 300);
  }
}

function showTooltip(element, text) {
  const tooltip = document.createElement('div');
  tooltip.className = "absolute -mt-10 px-2 py-1 bg-gray-800 text-white text-xs rounded-md";
  tooltip.textContent = text;

  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width/2 - 30}px`;
  tooltip.style.top = `${rect.top - 5}px`;

  document.body.appendChild(tooltip);

  setTimeout(() => {
    tooltip.remove();
  }, 1000);
}
