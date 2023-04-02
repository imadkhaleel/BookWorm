ebooks = [
    {
        "author": "Marsic and co",
        "publisher": "Marsic",
        "genre": "Fiction",
        "title": "Book with id 5",
        "numberOfPages": 111,
        "ISBN": "111222223336",
        "description": "Description of book 1",
        "publishDate": Date.now(),
        "coverImageURL": "https://www.ece.rutgers.edu/sites/default/files/Marsic.jpg",
        "availableCopies": 1
    },
    {
        "author": "Marsic and co",
        "publisher": "Marsic",
        "genre": "Non-fiction",
        "title": "Book with id 7",
        "numberOfPages": 222,
        "ISBN": "1112222233337",
        "description": "Description of book 2",
        "publishDate": "2022-10-31T09:00:00.594Z",
        "coverImageURL": "https://www.ece.rutgers.edu/sites/default/files/Marsic.jpg",
        "availableCopies": 3
    },
];

const populateTable = () => {
    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ``;

    let counter = 1;
    ebooks.forEach((ebook) => {
        tableBody.innerHTML =
            tableBody.innerHTML +
            `<tr>
      <th scope="row">${counter}</th>
      <td>${ebook.title}</td>
      <td>${ebook.author}</td>
      <td>${ebook.description}</td>
      <td>${ebook.ISBN}</td>
      <td>${ebook.availableCopies}</td>
    </tr>`;
        counter += 1;
    });
};

populateTable();

document.querySelector("[key='title']").addEventListener("click", (e) => {
    ebooks.sort((a, b) => a.title.localeCompare(b.title));
    populateTable();
});

document.querySelector("[key='author']").addEventListener("click", (e) => {
    ebooks.sort((a, b) => a.author.localeCompare(b.artist));
    populateTable();
});

document.querySelector("[key='ISBN']").addEventListener("click", (e) => {
    ebooks.sort((a, b) => b.ISBN - a.ISBN);
    populateTable();
});

document.querySelector("[key='duration']").addEventListener("click", (e) => {
    ebooks.sort((a, b) => a.numberOfPages - b.numberOfPages);
    populateTable();
});