document.addEventListener("DOMContentLoaded", function () {
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

    if (max === min) {
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
      .filter((name) => name.toLowerCase().includes(lowerInput));

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
        document.getElementById("colorForm").dispatchEvent(new Event("submit"));
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
      document.getElementById("colorForm").dispatchEvent(new Event("submit"));
    }
  });

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
});
