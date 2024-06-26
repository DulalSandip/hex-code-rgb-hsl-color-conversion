document.addEventListener('DOMContentLoaded', function() {
function hexToRGB(hex) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHSL(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function updateColorDisplay(hex, hsl, rgb, name) {
  document.getElementById("hexValue").innerText = hex;
  document.getElementById(
    "hslValue"
  ).innerText = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  document.getElementById(
    "rgbValue"
  ).innerText = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  document.getElementById("colorName").innerText = name;
  document.getElementById("colorBox").style.backgroundColor = hex;
}

document.getElementById("colorForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let input = document.getElementById("colorInput").value.trim();
  let errorMessage = document.getElementById("errorMessage");
  let hex, name;

  if (input.startsWith("#")) {
    if (!/^#[0-9A-F]{6}$/i.test(input)) {
      errorMessage.innerText = "Please enter a valid hex color code.";
      errorMessage.style.display = "block";
      return;
    }
    hex = input;
    name = "N/A";
  } else {
    name = input.toLowerCase();
    console.log(name);
    hex = colorNames[name];

    if (!hex) {
      errorMessage.innerText = "Please enter a valid color name.";
      errorMessage.style.display = "block";
      return;
    }
  }

  let rgb = hexToRGB(hex);
  let hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);

  document.getElementById("colorResult").style.display = "block";
  updateColorDisplay(hex, hsl, rgb, name);
  errorMessage.style.display = "none";
});
});