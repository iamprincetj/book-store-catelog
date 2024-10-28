const bookListContainer = document.querySelector(".book-lists-container");
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const selectElement = document.getElementById("select-genres");
const form = document.querySelector("form");
const paginateContainer = document.querySelector(".paginate-container");
let booksPerPage = window.outerWidth <= 991 ? 20 : 21;
let currentBookIndex = booksPerPage;

// This gets our books from its Json file, will be used by different functions
const getBooks = async () => {
  const req = await fetch("hack51_sample_book.json");
  const data = req.json();
  return data;
};

// This function helps with populating the filtering system by genres
// select HTML Tag with the genres will have in our original data.
const getDataGenres = async () => {
  const data = await getBooks();
  const dataGenres = data.map((item) => item.genre);
  const dataGenresSet = new Set(dataGenres);

  dataGenresSet.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectElement.appendChild(option);
  });
};

// This function popultae the page with the books in the data
const populatePage = (dataParam, currentBookIndex) => {
  const searchInputValue = searchInput.value;
  const selectElementValue =
    selectElement.options[selectElement.selectedIndex].value;
  // This is to make sure the data to be finally shown on the page
  // works with the current search text and slected genre
  const data = dataParam.filter(
    (item) =>
      (item.title.toLowerCase().includes(searchInputValue.toLowerCase()) ||
        item.author.toLowerCase().includes(searchInputValue.toLowerCase())) &&
      item.genre
        .toLowerCase()
        .includes(
          selectElementValue === "All genres"
            ? ""
            : selectElementValue.toLowerCase()
        )
  );

  if (data.length < 1) {
    if (searchInputValue && selectElementValue) {
      bookListContainer.innerHTML = `No Books by ${searchInputValue} with genre ${selectElementValue}`;
    } else {
      bookListContainer.innerHTML = "No Books";
    }
    return null;
  }
  const firstShownBookIdx = currentBookIndex - booksPerPage;
  const lastShownBookIdx = currentBookIndex - 1;
  bookListContainer.innerHTML = "";
  const bookList = [];

  // Displays all the nooks to the page

  data.forEach((val, idx) => {
    // This condition help with the pagination
    if (idx >= firstShownBookIdx && idx <= lastShownBookIdx) {
      const randonNum = Math.floor(Math.random() * 12);
      const image = `images/book-cover-${randonNum}.png`;
      const li = document.createElement("div");
      li.classList.add("book-list");
      const div = document.createElement("div");
      div.classList.add("book-image-container");
      const h2 = document.createElement("h2");
      const h3 = document.createElement("h3");
      const p = document.createElement("p");
      const { title, author, genre } = val;
      h2.textContent = title;
      h3.textContent = author;
      p.textContent = genre;
      div.style.backgroundImage = `url(${image})`;
      div.appendChild(p);
      li.appendChild(div);
      li.appendChild(h3);
      li.appendChild(h2);
      bookList.push(li);
    }
  });

  if (bookList.length < 1) {
    if (searchInputValue && selectElementValue) {
      bookListContainer.innerHTML = `No Books by ${searchInputValue} with genre ${selectElementValue}`;
    } else {
      bookListContainer.innerHTML = "No Books";
    }

    return null;
  }

  bookList.forEach((val) => {
    bookListContainer.appendChild(val);
  });
};

// This function helps with our initial populating of the books, it will be used in other functions
const initialPopulate = async (currentBookIndex) => {
  const selectedGenre =
    selectElement.options[selectElement.selectedIndex].value;
  const data = await getBooks();
  const filteredData = data.filter((item) => item.genre === selectedGenre);
  populatePage(
    selectedGenre === "All genres" ? data : filteredData,
    currentBookIndex
  );
};

// This function gets called on the genre filtering
selectElement.addEventListener("change", async (e) => {
  const selectedGenre = e.target.options[selectElement.selectedIndex].value;
  if (selectedGenre === "All genres") {
    paginatePage();
  } else {
    initialPopulate(booksPerPage);
    paginateContainer.innerHTML = "";
  }
});

// This function get called on searching for books
const getSearchedBooks = async (e) => {
  e.preventDefault();
  const books = await getBooks();
  const searchedText = searchInput.value;

  // filters the book list based on title or author
  const searchedBooks = books.filter(
    (item) =>
      item.title.toLowerCase().includes(searchedText.toLowerCase()) ||
      item.author.toLowerCase().includes(searchedText.toLowerCase())
  );
  // If there is a searched word it populates the page with the filtered
  // searched bookList removing the paginate button.
  // Else it shows the whole books with the paginate buttons
  if (searchedText) {
    populatePage(searchedBooks, booksPerPage);
    paginateContainer.innerHTML = "";
  } else {
    paginatePage();
  }
};

// This uses our func getSearchedBooks on search button clicked
// Or on Form Submit
searchBtn.addEventListener("click", getSearchedBooks);
form.addEventListener("submit", getSearchedBooks);

// PAGINATION

const paginatePage = async () => {
  const data = await getBooks();

  const btnNum = Math.ceil(data.length / booksPerPage);
  if (
    selectElement.options[selectElement.selectedIndex].value === "All genres"
  ) {
    // populates the page with paginate buttons
    for (let i = 1; i <= btnNum; i++) {
      const buttonElement = document.createElement("button");
      buttonElement.classList.add("paginate-btn");
      buttonElement.classList.add(i === 1 ? "active" : "paginate-btn");
      buttonElement.textContent = i;
      setTimeout(() => {
        paginateContainer.append(buttonElement);
      }, 2000);

      buttonElement.addEventListener("click", () => {
        const clickedBtn = buttonElement.textContent;
        const buttons = document.querySelectorAll(".paginate-btn");
        buttons.forEach((item) => {
          item.classList.remove("active");
        });
        buttonElement.classList.add("active");

        currentBookIndex = clickedBtn * booksPerPage;
        initialPopulate(currentBookIndex);

        // scrolls to the top of the page on paginate
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      });
    }
  }
  initialPopulate(currentBookIndex);
};

paginatePage();

getDataGenres();
