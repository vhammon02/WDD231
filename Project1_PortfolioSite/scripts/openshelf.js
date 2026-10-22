/*
OpenShelf reference implementation
To activate this file, remove the leading // from the code lines below.
It uses Open Library's public Search API, which does not require an API key.
Check the API's current usage guidance before deploying or increasing request volume.
Use the browser Network panel to inspect the request URL, status, response, and timing.
Future direction: add pagination, subject filters, or a book-detail view after this version works.
Future direction: localStorage is browser-specific; use a backend only if you want accounts or syncing.
*/

const searchForm = document.querySelector("#book-search-form");
const searchInput = document.querySelector("#book-search");
const searchStatus = document.querySelector("#search-status");
const searchResults = document.querySelector("#search-results");
const readBooks = document.querySelector("#read-books");
const readBooksStatus = document.querySelector("#read-books-status");
const storageKey = "openshelf-read-books";

if (
	!(searchForm instanceof HTMLFormElement) ||
	!(searchInput instanceof HTMLInputElement) ||
	!(searchStatus instanceof HTMLElement) ||
	!(searchResults instanceof HTMLElement) ||
	!(readBooks instanceof HTMLElement) ||
	!(readBooksStatus instanceof HTMLElement)
) {
	throw new Error("OpenShelf page elements are missing. Check the IDs in openshelf.html.");
}

let searchBooks = [];

function setStatus(element, message, state = "info") {
	element.textContent = message;
	element.dataset.state = state;
}

function isSavedBook(book) {
	return Boolean(
		book &&
		typeof book.key === "string" &&
		typeof book.title === "string" &&
		typeof book.authors === "string" &&
		(book.year === null || Number.isInteger(book.year)) &&
		(book.coverId === null || Number.isInteger(book.coverId)) &&
		typeof book.rating === "string" &&
		(book.rating === "" || ["1", "2", "3", "4", "5"].includes(book.rating)) &&
		typeof book.review === "string"
	);
}

function loadSavedBooks() {
	try {
		const savedData = localStorage.getItem(storageKey);
		if (savedData === null) {
			return [];
		}

		const books = JSON.parse(savedData);
		if (!Array.isArray(books) || !books.every(isSavedBook)) {
			throw new Error("Saved shelf data is not in the expected format.");
		}

		return books;
	} catch (error) {
		setStatus(
			readBooksStatus,
			`Could not load your saved shelf: ${error.message} No changes were made.`,
			"error"
		);
		return null;
	}
}

let savedBooks = loadSavedBooks();

function saveSavedBooks(nextBooks) {
	try {
		localStorage.setItem(storageKey, JSON.stringify(nextBooks));
		savedBooks = nextBooks;
		renderSavedBooks(savedBooks);
		setStatus(readBooksStatus, "Your shelf and review were saved in this browser.", "success");
		return true;
	} catch (error) {
		setStatus(
			readBooksStatus,
			`Could not save your shelf: ${error.message}`,
			"error"
		);
		return false;
	}
}

function makeBookFromApiResult(book) {
	const authors = Array.isArray(book.author_name)
		? book.author_name.filter((author) => typeof author === "string").join(", ")
		: "";

	return {
		key: book.key,
		title: book.title,
		authors: authors || "Author not listed",
		year: Number.isInteger(book.first_publish_year) ? book.first_publish_year : null,
		coverId: Number.isInteger(book.cover_i) ? book.cover_i : null,
		rating: "",
		review: ""
	};
}

function addText(element, tagName, text, className = "") {
	const child = document.createElement(tagName);
	child.textContent = text;
	if (className) {
		child.classList.add(className);
	}
	element.append(child);
	return child;
}

function addBookCover(card, book) {
	if (book.coverId === null) {
		return;
	}

	const cover = document.createElement("img");
	cover.src = `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;
	cover.alt = `Cover of ${book.title}`;
	cover.loading = "lazy";
	card.append(cover);
}

function createBookCard(book, includeAddButton = false) {
	const card = document.createElement("article");
	card.classList.add("openshelf-card");
	addBookCover(card, book);

	const details = document.createElement("div");
	details.classList.add("openshelf-card-details");
	addText(details, "h4", book.title);
	addText(details, "p", `By ${book.authors}`);
	if (book.year !== null) {
		addText(details, "p", `First published ${book.year}`);
	}

	if (includeAddButton) {
		const addButton = document.createElement("button");
		addButton.type = "button";
		addButton.dataset.bookKey = book.key;
		addButton.textContent = "Add to my read books";
		details.append(addButton);
	}

	card.append(details);
	return card;
}

function renderSearchResults(books) {
	searchBooks = books;
	searchResults.replaceChildren();

	books.forEach((book) => {
		searchResults.append(createBookCard(book, true));
	});

	if (books.length === 0) {
		setStatus(searchStatus, "No books matched that search. Try another title or author.", "empty");
	} else {
		setStatus(searchStatus, `Found ${books.length} book${books.length === 1 ? "" : "s"}.`, "success");
	}
}

function createReviewForm(book, index) {
	const form = document.createElement("form");
	form.classList.add("openshelf-review-form");
	form.dataset.bookKey = book.key;

	const ratingId = `book-rating-${index}`;
	const ratingLabel = document.createElement("label");
	ratingLabel.htmlFor = ratingId;
	ratingLabel.textContent = "Your rating";

	const rating = document.createElement("select");
	rating.id = ratingId;
	rating.name = "rating";
	rating.required = true;

	const placeholder = document.createElement("option");
	placeholder.value = "";
	placeholder.textContent = "Choose a rating";
	placeholder.disabled = true;
	placeholder.selected = book.rating === "";
	rating.append(placeholder);

	[5, 4, 3, 2, 1].forEach((score) => {
		const option = document.createElement("option");
		option.value = String(score);
		option.textContent = `${score} out of 5`;
		option.selected = book.rating === option.value;
		rating.append(option);
	});

	const reviewId = `book-review-${index}`;
	const reviewLabel = document.createElement("label");
	reviewLabel.htmlFor = reviewId;
	reviewLabel.textContent = "Your review (optional)";

	const review = document.createElement("textarea");
	review.id = reviewId;
	review.name = "review";
	review.rows = 3;
	review.maxLength = 1000;
	review.value = book.review;

	const saveButton = document.createElement("button");
	saveButton.type = "submit";
	saveButton.textContent = "Save rating and review";

	form.append(ratingLabel, rating, reviewLabel, review, saveButton);
	return form;
}

function renderSavedBooks(books) {
	readBooks.replaceChildren();

	if (books === null) {
		return;
	}

	if (books.length === 0) {
		setStatus(readBooksStatus, "No books saved yet. Find a book above and add it to your read books.", "empty");
		return;
	}

	setStatus(readBooksStatus, `${books.length} book${books.length === 1 ? "" : "s"} on your read list.`, "success");
	books.forEach((book, index) => {
		const card = createBookCard(book);
		card.append(createReviewForm(book, index));
		readBooks.append(card);
	});
}

searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	const query = searchInput.value.trim();
	if (!query) {
		setStatus(searchStatus, "Enter a title, author, or subject to search.", "error");
		searchInput.focus();
		return;
	}

	const submitButton = searchForm.querySelector('button[type="submit"]');
	submitButton.disabled = true;
	searchResults.replaceChildren();
	setStatus(searchStatus, "Searching Open Library...", "loading");

	try {
		const fields = "key,title,author_name,first_publish_year,cover_i";
		const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=${fields}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Book search failed with HTTP status ${response.status}.`);
		}

		const data = await response.json();
		if (!Array.isArray(data.docs)) {
			throw new Error("Open Library returned an unexpected response. Please try again later.");
		}

		const books = data.docs
			.filter((book) => book && typeof book.key === "string" && typeof book.title === "string")
			.map(makeBookFromApiResult);
		renderSearchResults(books);
	} catch (error) {
		searchBooks = [];
		searchResults.replaceChildren();
		setStatus(searchStatus, `Could not search for books: ${error.message}`, "error");
	} finally {
		submitButton.disabled = false;
	}
});

searchResults.addEventListener("click", (event) => {
	const target = event.target;
	if (!(target instanceof HTMLButtonElement) || !target.dataset.bookKey) {
		return;
	}

	if (!Array.isArray(savedBooks)) {
		setStatus(readBooksStatus, "Your saved shelf could not be loaded, so no changes were made.", "error");
		return;
	}

	const selectedBook = searchBooks.find((book) => book.key === target.dataset.bookKey);
	if (!selectedBook) {
		setStatus(searchStatus, "That search result is no longer available. Search again and retry.", "error");
		return;
	}

	if (savedBooks.some((book) => book.key === selectedBook.key)) {
		setStatus(readBooksStatus, `${selectedBook.title} is already on your read list.`, "info");
		return;
	}

	saveSavedBooks([...savedBooks, selectedBook]);
});

readBooks.addEventListener("submit", (event) => {
	event.preventDefault();
	const form = event.target;
	if (!(form instanceof HTMLFormElement) || !Array.isArray(savedBooks)) {
		setStatus(readBooksStatus, "Your shelf is unavailable, so the review was not saved.", "error");
		return;
	}

	const rating = form.querySelector('select[name="rating"]');
	const review = form.querySelector('textarea[name="review"]');
	if (!(rating instanceof HTMLSelectElement) || !(review instanceof HTMLTextAreaElement)) {
		setStatus(readBooksStatus, "The rating form is incomplete. Refresh and try again.", "error");
		return;
	}

	const bookKey = form.dataset.bookKey;
	const hasBook = savedBooks.some((book) => book.key === bookKey);
	if (!hasBook) {
		setStatus(readBooksStatus, "That book is no longer on your read list. Refresh and try again.", "error");
		return;
	}

	const updatedBooks = savedBooks.map((book) => (
		book.key === bookKey
			? { ...book, rating: rating.value, review: review.value.trim() }
			: book
	));
	saveSavedBooks(updatedBooks);
});

renderSavedBooks(savedBooks);
