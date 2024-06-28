document.addEventListener("DOMContentLoaded", function () {
  // Function to convert hex color to RGB
  function hexToRGB(hex) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  // Function to convert RGB to HSL
  function rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
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

  // Function to update color display in UI
  function updateColorDisplay(hex, hsl, rgb, name) {
    document.getElementById("hexValue").innerText = hex;
    document.getElementById(
      "hslValue"
    ).innerText = `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    document.getElementById(
      "rgbValue"
    ).innerText = `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById("colorName").innerText = name;
    document.getElementById("colorBox").style.backgroundColor = hex;
    document.getElementById("colorPicker").value = hex;
    showSimilarColors(hex);
  }

  // Function to show similar colors based on the provided hex color
  function showSimilarColors(hex) {
    const similarColorsList = document.getElementById("similarColorsList");
    similarColorsList.innerHTML = ""; // Clear previous similar colors

    // Calculate variations of the provided hex color
    const variations = calculateColorVariations(hex);

    // Add each variation as a card in the similar colors section, except for the exact input color
    variations.forEach((color) => {
      if (color.toLowerCase() !== hex.toLowerCase()) {
        // Check if the color is not the exact input color
        const rgb = hexToRGB(color);
        const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
        const colorCard = createSimilarColorCard(color, hsl, rgb);
        similarColorsList.appendChild(colorCard);
      }
    });

    // Show the similar colors section
    const similarColorsSection = document.getElementById("similarColors");
    similarColorsSection.style.display = "block";
  }

  // Function to calculate color variations (lighter, darker, complementary, analogous)
  function calculateColorVariations(hex) {
    const variations = [];

    // Original color
    variations.push(hex);

    // Lighter and darker shades
    variations.push(lightenDarkenColor(hex, 20));
    variations.push(lightenDarkenColor(hex, -20));

    // Complementary color
    variations.push(generateComplementaryColor(hex));

    // Analogous colors
    variations.push(...generateAnalogousColors(hex));

    // Limit variations to 20 or fewer
    return variations.slice(0, 20);
  }

  // Function to lighten or darken a hex color by a specified amount
  function lightenDarkenColor(color, amount) {
    // Check if color is a valid hex format
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return null; // Return null for invalid color
    }

    let usePound = false;
    if (color[0] === "#") {
      color = color.slice(1);
      usePound = true;
    }

    let num = parseInt(color, 16);
    let r = (num >> 16) + amount;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00ff) + amount;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000ff) + amount;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    // Convert new RGB values back to hex
    let newColor = (g | (b << 8) | (r << 16)).toString(16);
    while (newColor.length < 6) {
      newColor = "0" + newColor;
    }

    return (usePound ? "#" : "") + newColor;
  }

  // Function to generate complementary color for a given hex color
  function generateComplementaryColor(hex) {
    const { r, g, b } = hexToRGB(hex);
    const hsl = rgbToHSL(r, g, b);
    const complementaryHue = (hsl.h + 180) % 360;
    return hslToHex(complementaryHue, hsl.s, hsl.l);
  }

  // Function to convert HSL to hex
  function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Function to generate analogous colors for a given hex color
  function generateAnalogousColors(hex) {
    const { r, g, b } = hexToRGB(hex);
    const hsl = rgbToHSL(r, g, b);
    const hues = [];
    const step = 30; // Adjust this step as needed

    for (let i = -2; i <= 2; i++) {
      let hue = (hsl.h + i * step) % 360;
      if (hue < 0) {
        hue += 360;
      }
      hues.push(hslToHex(hue, hsl.s, hsl.l));
    }

    return hues;
  }

  // Function to create a card for similar color display
  function createSimilarColorCard(hex, hsl, rgb) {
    const card = document.createElement("div");
    card.classList.add("col-md-3", "mb-3");

    const innerCard = document.createElement("div");
    innerCard.classList.add("card", "shadow");

    const colorBox = document.createElement("div");
    colorBox.classList.add("color-box");
    colorBox.style.backgroundColor = hex;

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h5");
    title.classList.add("card-title", "text-center");
    title.textContent = `Are you searching this?`;

    const detailsHex = document.createElement("p");
    detailsHex.classList.add("card-text", "text-center");
    detailsHex.textContent = `Hex: ${hex}`;

    const detailsHSL = document.createElement("p");
    detailsHSL.classList.add("card-text", "text-center");
    detailsHSL.textContent = `HSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

    const detailsRGB = document.createElement("p");
    detailsRGB.classList.add("card-text", "text-center");
    detailsRGB.textContent = `RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    cardBody.appendChild(title);
    cardBody.appendChild(colorBox);
    cardBody.appendChild(detailsHex);
    cardBody.appendChild(detailsHSL);
    cardBody.appendChild(detailsRGB);
    innerCard.appendChild(cardBody);
    card.appendChild(innerCard);

    return card;
  }

  // Functionality for color input and suggestions
  const colorInput = document.getElementById("colorInput");
  const suggestions = document.getElementById("suggestions");

  colorInput.addEventListener("input", function () {
    const input = this.value.trim();
    const suggestionsList = suggestColorNames(input);
    updateSuggestions(suggestionsList);

    // Hide suggestions if input is empty
    if (input === "") {
      suggestions.style.display = "none";
    }
  });

  colorInput.addEventListener("keydown", function (event) {
    const key = event.key;

    if (key === "ArrowUp" || key === "ArrowDown") {
      event.preventDefault(); // Prevent default scrolling behavior
      const currentActive = suggestions.querySelector("li.active");
      let nextActive;

      if (!currentActive && key === "ArrowDown") {
        nextActive = suggestions.querySelector("li");
      } else if (currentActive && key === "ArrowUp") {
        nextActive = currentActive.previousElementSibling;
      } else if (currentActive && key === "ArrowDown") {
        nextActive = currentActive.nextElementSibling;
      }

      if (nextActive) {
        if (currentActive) {
          currentActive.classList.remove("active");
        }
        nextActive.classList.add("active");
        nextActive.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else if (key === "Enter") {
      const activeSuggestion = suggestions.querySelector("li.active");
      if (activeSuggestion) {
        colorInput.value = activeSuggestion.textContent;
        suggestions.style.display = "none";

        document
          .getElementById("colorForm")
          .dispatchEvent(new Event("submit", { cancelable: true }));
      }
    }
  });

  colorInput.addEventListener("focusout", function () {
    // Hide suggestions when focus is lost
    setTimeout(() => {
      suggestions.style.display = "none";
    }, 200); // Delay to allow click event on suggestion
  });

  suggestions.addEventListener("click", function (event) {
    if (event.target.tagName === "LI") {
      colorInput.value = event.target.textContent;
      suggestions.style.display = "none";
      document
        .getElementById("colorForm")
        .dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });

  // Form submission handling
  document.getElementById("colorForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let input = colorInput.value.trim();
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
    suggestions.style.display = "none"; // Hide suggestions after selection
  });

  // Tab switch event handling
  document.querySelectorAll(".nav-link").forEach((elem) => {
    elem.addEventListener("click", function (e) {
      const value = e.target.getAttribute("href").substring(1);
      document.querySelectorAll(".tab-pane").forEach((tabPane) => {
        tabPane.classList.remove("active", "show");
      });
      document.getElementById(value).classList.add("active", "show");

      // Clear results when switching tabs
      document.getElementById("colorResult").style.display = "none";
      colorInput.value = "";

      // Automatically display color picker when the color picker tab is selected
      if (value === "picker") {
        setTimeout(() => {
          colorPicker.click();
        }, 0);
      }
    });
  });

  // Initialize color picker with a default value
  const colorPicker = document.getElementById("colorPicker");
  colorPicker.addEventListener("input", function () {
    const hex = this.value;
    const rgb = hexToRGB(hex);
    const hsl = rgbToHSL(rgb.r, rgb.g, rgb.b);
    updateColorDisplay(hex, hsl, rgb, "N/A");
    document.getElementById("colorResult").style.display = "block";
  });

  colorPicker.value = "#00B0F0"; // Set a default color value
  const defaultRGB = hexToRGB(colorPicker.value);
  const defaultHSL = rgbToHSL(defaultRGB.r, defaultRGB.g, defaultRGB.b);
  updateColorDisplay(colorPicker.value, defaultHSL, defaultRGB, "N/A");

  // Update the year in the footer
  document.getElementById("year").innerText = new Date().getFullYear();

  // Suggestions functions (assuming colorNames object is defined elsewhere)
  function suggestColorNames(input) {
    const lowerInput = input.toLowerCase().trim();
    const suggestions = Object.keys(colorNames)
      .sort((a, b) => {
        if (a.toLowerCase() === lowerInput) return -1;
        if (b.toLowerCase() === lowerInput) return 1;
        return (
          a.toLowerCase().localeCompare(lowerInput) -
          b.toLowerCase().localeCompare(lowerInput)
        );
      })
      .filter((name) => name.toLowerCase().includes(lowerInput))
      .slice(0, 20); // Limit suggestions to 20 items

    return suggestions; // Return all suggestions that match the input
  }

  function updateSuggestions(suggestions) {
    const suggestionList = document.getElementById("suggestions");
    suggestionList.innerHTML = "";
    suggestions.forEach((name) => {
      const listItem = document.createElement("li");
      listItem.textContent = name;
      suggestionList.appendChild(listItem);
    });
    suggestionList.style.display = suggestions.length ? "block" : "none";
    activateFirstSuggestion();
  }

  function activateFirstSuggestion() {
    const suggestionList = document.getElementById("suggestions");
    const firstSuggestion = suggestionList.querySelector("li");
    if (firstSuggestion) {
      firstSuggestion.classList.add("active");
    }
  }
});
