const quotes = [
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

const elements = {
  quoteDisplay: null,
  newQuoteButton: null,
  categorySelect: null,
  formContainer: null,
  newQuoteText: null,
  newQuoteCategory: null,
};

function getCategories() {
  const categories = new Set(quotes.map((quote) => quote.category.trim()));
  return ["All", ...Array.from(categories).sort()];
}

function renderCategoryOptions() {
  const categories = getCategories();
  elements.categorySelect.innerHTML = "";

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categorySelect.appendChild(option);
  });
}

function showRandomQuote() {
  const selectedCategory = elements.categorySelect.value;
  const availableQuotes = quotes.filter((quote) =>
    selectedCategory === "All" ? true : quote.category === selectedCategory,
  );

  elements.quoteDisplay.innerHTML = "";

  if (availableQuotes.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No quotes found for this category yet.";
    elements.quoteDisplay.appendChild(message);
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const quote = availableQuotes[randomIndex];

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = `Category: ${quote.category}`;

  elements.quoteDisplay.appendChild(quoteText);
  elements.quoteDisplay.appendChild(quoteCategory);
}

function addQuote() {
  const textValue = elements.newQuoteText.value.trim();
  const categoryValue = elements.newQuoteCategory.value.trim();

  if (!textValue || !categoryValue) {
    alert("Please provide both a quote and a category.");
    return;
  }

  quotes.push({ text: textValue, category: categoryValue });
  elements.newQuoteText.value = "";
  elements.newQuoteCategory.value = "";

  renderCategoryOptions();
  elements.categorySelect.value = categoryValue;
  showRandomQuote();
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

function createCategoryFilter() {
  const controls = document.getElementById("controls");
  const label = document.createElement("label");
  label.textContent = "Select category: ";
  label.setAttribute("for", "categoryFilter");

  const select = document.createElement("select");
  select.id = "categoryFilter";
  select.addEventListener("change", showRandomQuote);

  label.appendChild(select);
  controls.appendChild(label);

  elements.categorySelect = select;
  renderCategoryOptions();
}

document.addEventListener("DOMContentLoaded", () => {
  elements.quoteDisplay = document.getElementById("quoteDisplay");
  elements.newQuoteButton = document.getElementById("newQuote");
  elements.formContainer = document.getElementById("formContainer");

  createCategoryFilter();
  createAddQuoteForm();

  elements.newQuoteButton.addEventListener("click", showRandomQuote);
  showRandomQuote();
});
