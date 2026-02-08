const defaultQuotes = [
  {
    text: "The only way to do great work is to love what you do.",
    category: "Motivation",
  },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  {
    text: "In the middle of difficulty lies opportunity.",
    category: "Inspiration",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    category: "Programming",
  },
  { text: "Dream big and dare to fail.", category: "Motivation" },
];

let quotes = [];

const STORAGE_KEYS = {
  quotes: "dynamicQuotes",
  lastQuote: "lastViewedQuote",
  lastFilter: "lastSelectedCategory",
};

const elements = {
  quoteDisplay: null,
  newQuoteButton: null,
  categorySelect: null,
  formContainer: null,
  newQuoteText: null,
  newQuoteCategory: null,
};

function populateCategories() {
  if (!elements.categorySelect) {
    return;
  }

  const categories = new Set(quotes.map((quote) => quote.category.trim()));
  const sortedCategories = Array.from(categories).filter(Boolean).sort();

  elements.categorySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  elements.categorySelect.appendChild(allOption);

  sortedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categorySelect.appendChild(option);
  });
}

function saveQuotes() {
  localStorage.setItem(STORAGE_KEYS.quotes, JSON.stringify(quotes));
}

function loadQuotes() {
  const savedQuotes = localStorage.getItem(STORAGE_KEYS.quotes);
  if (!savedQuotes) {
    quotes = [...defaultQuotes];
    return;
  }

  try {
    const parsedQuotes = JSON.parse(savedQuotes);
    if (Array.isArray(parsedQuotes)) {
      quotes = parsedQuotes.filter((quote) => quote?.text && quote?.category);
    } else {
      quotes = [...defaultQuotes];
    }
  } catch (error) {
    quotes = [...defaultQuotes];
  }
}

function renderQuote(quote) {
  elements.quoteDisplay.innerHTML = "";

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = `Category: ${quote.category}`;

  elements.quoteDisplay.appendChild(quoteText);
  elements.quoteDisplay.appendChild(quoteCategory);

  sessionStorage.setItem(STORAGE_KEYS.lastQuote, JSON.stringify(quote));
}

function renderQuoteList(quotesToShow) {
  elements.quoteDisplay.innerHTML = "";

  if (quotesToShow.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No quotes found for this category yet.";
    elements.quoteDisplay.appendChild(message);
    return;
  }

  quotesToShow.forEach((quote) => {
    const quoteWrapper = document.createElement("div");
    const quoteText = document.createElement("p");
    quoteText.textContent = `"${quote.text}"`;

    const quoteCategory = document.createElement("small");
    quoteCategory.textContent = `Category: ${quote.category}`;

    quoteWrapper.appendChild(quoteText);
    quoteWrapper.appendChild(quoteCategory);
    elements.quoteDisplay.appendChild(quoteWrapper);
  });
}

function showRandomQuote() {
  const selectedCategory = elements.categorySelect.value;
  const availableQuotes = quotes.filter((quote) =>
    selectedCategory === "all" ? true : quote.category === selectedCategory,
  );

  if (availableQuotes.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No quotes found for this category yet.";
    elements.quoteDisplay.appendChild(message);
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const quote = availableQuotes[randomIndex];
  renderQuote(quote);
}

function filterQuotes() {
  if (!elements.categorySelect) {
    return;
  }

  const selectedCategory = elements.categorySelect.value;
  localStorage.setItem(STORAGE_KEYS.lastFilter, selectedCategory);

  const filteredQuotes = quotes.filter((quote) =>
    selectedCategory === "all" ? true : quote.category === selectedCategory,
  );

  renderQuoteList(filteredQuotes);
}

function addQuote() {
  const textValue = elements.newQuoteText.value.trim();
  const categoryValue = elements.newQuoteCategory.value.trim();

  if (!textValue || !categoryValue) {
    alert("Please provide both a quote and a category.");
    return;
  }

  quotes.push({ text: textValue, category: categoryValue });
  saveQuotes();
  elements.newQuoteText.value = "";
  elements.newQuoteCategory.value = "";

  const currentFilter = elements.categorySelect?.value || "all";
  populateCategories();
  if (currentFilter !== "all") {
    elements.categorySelect.value = currentFilter;
  }

  filterQuotes();
}

function createAddQuoteForm() {
  const formWrapper = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formWrapper.appendChild(quoteInput);
  formWrapper.appendChild(categoryInput);
  formWrapper.appendChild(addButton);

  elements.formContainer.appendChild(formWrapper);
  elements.newQuoteText = quoteInput;
  elements.newQuoteCategory = categoryInput;
}

function setupCategoryFilter() {
  elements.categorySelect = document.getElementById("categoryFilter");
  if (!elements.categorySelect) {
    return;
  }

  populateCategories();
  const storedFilter = localStorage.getItem(STORAGE_KEYS.lastFilter);
  if (storedFilter) {
    elements.categorySelect.value = storedFilter;
  }

  elements.categorySelect.addEventListener("change", filterQuotes);
}

function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();

  URL.revokeObjectURL(url);
}

function exportQuotes() {
  exportToJsonFile();
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = (loadEvent) => {
    try {
      const importedQuotes = JSON.parse(loadEvent.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid file format. Expected a JSON array of quotes.");
        return;
      }

      const validQuotes = importedQuotes.filter(
        (quote) => quote?.text && quote?.category,
      );

      if (validQuotes.length === 0) {
        alert("No valid quotes found in the file.");
        return;
      }

      quotes.push(...validQuotes);
      saveQuotes();
      populateCategories();
      elements.categorySelect.value = "all";
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Unable to import quotes. Please check the file format.");
    }
  };

  fileReader.readAsText(file);
  event.target.value = "";
}

function setupStorageControls() {
  const storageControls = document.getElementById("storageControls");
  if (!storageControls) {
    return;
  }

  let exportButton = document.getElementById("exportQuotes");
  let importInput = document.getElementById("importFile");

  if (!exportButton) {
    exportButton = document.createElement("button");
    exportButton.type = "button";
    exportButton.id = "exportQuotes";
    exportButton.textContent = "Export Quotes";
    storageControls.appendChild(exportButton);
  }

  if (!importInput) {
    importInput = document.createElement("input");
    importInput.type = "file";
    importInput.id = "importFile";
    importInput.accept = ".json";
    storageControls.appendChild(importInput);
  }

  exportButton.addEventListener("click", exportToJsonFile);
  importInput.addEventListener("change", importFromJsonFile);
}

function restoreLastQuote() {
  const lastQuoteRaw = sessionStorage.getItem(STORAGE_KEYS.lastQuote);
  if (!lastQuoteRaw) {
    return false;
  }

  try {
    const lastQuote = JSON.parse(lastQuoteRaw);
    if (lastQuote?.text && lastQuote?.category) {
      renderQuote(lastQuote);
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
}

document.addEventListener("DOMContentLoaded", () => {
  elements.quoteDisplay = document.getElementById("quoteDisplay");
  elements.newQuoteButton = document.getElementById("newQuote");
  elements.formContainer = document.getElementById("formContainer");

  loadQuotes();
  setupCategoryFilter();
  createAddQuoteForm();
  setupStorageControls();

  elements.newQuoteButton.addEventListener("click", showRandomQuote);

  filterQuotes();
});
