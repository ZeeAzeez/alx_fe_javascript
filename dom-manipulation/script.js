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
  lastSync: "lastSyncTimestamp",
  localBackup: "localQuotesBackup",
};

const elements = {
  quoteDisplay: null,
  newQuoteButton: null,
  categorySelect: null,
  formContainer: null,
  newQuoteText: null,
  newQuoteCategory: null,
  syncStatus: null,
  syncNowButton: null,
  conflictActions: null,
  keepLocalButton: null,
  useServerButton: null,
};

const SERVER_API_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL_MS = 30000;
let lastServerQuotes = [];

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

function backupLocalQuotes() {
  localStorage.setItem(STORAGE_KEYS.localBackup, JSON.stringify(quotes));
}

function restoreLocalBackup() {
  const backup = localStorage.getItem(STORAGE_KEYS.localBackup);
  if (!backup) {
    return false;
  }

  try {
    const parsed = JSON.parse(backup);
    if (Array.isArray(parsed)) {
      quotes = parsed;
      saveQuotes();
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
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

  postQuoteToServer({ text: textValue, category: categoryValue });
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

function updateSyncStatus(message, isWarning = false) {
  if (!elements.syncStatus) {
    return;
  }

  elements.syncStatus.textContent = message;
  elements.syncStatus.style.color = isWarning ? "#b45309" : "#0f766e";
}

function showConflictActions(show) {
  if (!elements.conflictActions) {
    return;
  }

  elements.conflictActions.hidden = !show;
}

function normalizeQuote(quote) {
  return {
    text: String(quote.text || "").trim(),
    category: String(quote.category || "").trim(),
  };
}

function quotesAreEqual(localData, serverData) {
  if (localData.length !== serverData.length) {
    return false;
  }

  const localString = JSON.stringify(localData);
  const serverString = JSON.stringify(serverData);
  return localString === serverString;
}

async function fetchQuotesFromServer() {
  const response = await fetch(`${SERVER_API_URL}?_limit=5`);
  const data = await response.json();

  return data.map((item) =>
    normalizeQuote({
      text: item.title || item.body || "Server quote",
      category: "Server",
    }),
  );
}

async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });
  } catch (error) {
    updateSyncStatus("Offline: will sync when available.", true);
  }
}

async function syncQuotes({ manual = false } = {}) {
  try {
    updateSyncStatus("Syncing with server...");
    const serverQuotes = await fetchQuotesFromServer();
    lastServerQuotes = serverQuotes;

    const normalizedLocal = quotes.map(normalizeQuote);
    const normalizedServer = serverQuotes.map(normalizeQuote);

    if (!quotesAreEqual(normalizedLocal, normalizedServer)) {
      backupLocalQuotes();
      quotes = normalizedServer;
      saveQuotes();
      populateCategories();
      filterQuotes();
      localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString());
      updateSyncStatus("Server data applied. Conflicts resolved.", true);
      showConflictActions(true);
    } else {
      updateSyncStatus(manual ? "Already up to date." : "Synced.");
      showConflictActions(false);
    }
  } catch (error) {
    updateSyncStatus("Sync failed. Check your connection.", true);
  }
}

function keepLocalData() {
  const restored = restoreLocalBackup();
  if (!restored) {
    updateSyncStatus("No local backup available.", true);
    return;
  }

  populateCategories();
  filterQuotes();
  updateSyncStatus("Restored local data.");
  showConflictActions(false);
}

function useServerData() {
  if (lastServerQuotes.length) {
    quotes = lastServerQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
  }

  updateSyncStatus("Server data kept.");
  showConflictActions(false);
}

function setupSyncControls() {
  elements.syncStatus = document.getElementById("syncStatus");
  elements.syncNowButton = document.getElementById("syncNow");
  elements.conflictActions = document.getElementById("conflictActions");
  elements.keepLocalButton = document.getElementById("keepLocal");
  elements.useServerButton = document.getElementById("useServer");

  if (elements.syncNowButton) {
    elements.syncNowButton.addEventListener("click", () =>
      syncQuotes({ manual: true }),
    );
  }

  if (elements.keepLocalButton) {
    elements.keepLocalButton.addEventListener("click", keepLocalData);
  }

  if (elements.useServerButton) {
    elements.useServerButton.addEventListener("click", useServerData);
  }

  const lastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
  if (lastSync) {
    updateSyncStatus(`Last sync: ${new Date(lastSync).toLocaleString()}`);
  }
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
  setupSyncControls();

  elements.newQuoteButton.addEventListener("click", showRandomQuote);

  filterQuotes();

  syncQuotes();
  setInterval(syncQuotes, SYNC_INTERVAL_MS);
});
