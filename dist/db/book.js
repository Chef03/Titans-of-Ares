"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishBook = exports.removeBook = exports.registerBook = exports.UnfinishedBookError = exports.getAllBooks = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function getAllBooks($userID) {
    const sql = `
    SELECT * FROM Book 
    WHERE DiscordID = $userID
  `;
    const books = await (0, promiseWrapper_1.dbAll)(sql, { $userID });
    return books.map(x => ({ ...x, Finished: Boolean(x.Finished) }));
}
exports.getAllBooks = getAllBooks;
class UnfinishedBookError extends Error {
    constructor(message, book) {
        super(message);
        this.name = "UnfinishedBookError";
        this.book = book;
    }
}
exports.UnfinishedBookError = UnfinishedBookError;
async function registerBook(options) {
    const books = await getAllBooks(options.$userID);
    for (const book of books) {
        if (!book.Finished) {
            throw new UnfinishedBookError("unfinished book", book);
        }
    }
    const sql = `
    INSERT INTO Book (DiscordID, ChallengeID, Day, Name, Lesson, image)
    VALUES ($userID, $challengeID, $day, $name, $lesson, $image)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { ...options });
}
exports.registerBook = registerBook;
async function removeBook($bookID) {
    const sql = `
    DELETE FROM Book WHERE ID = $bookID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $bookID });
}
exports.removeBook = removeBook;
async function finishBook($bookID, $evaluation) {
    const sql = `
    UPDATE Book
    SET Finished = 1, Evaluation = $evaluation
    WHERE ID = $bookID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $bookID, $evaluation });
}
exports.finishBook = finishBook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYi9ib29rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUErQztBQWlCeEMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxPQUFlO0lBQzdDLE1BQU0sR0FBRyxHQUFHOzs7R0FHYixDQUFBO0lBRUMsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLHNCQUFLLEVBQVUsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNyRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFXLENBQUM7QUFDL0UsQ0FBQztBQVJELGtDQVFDO0FBRUQsTUFBYSxtQkFBb0IsU0FBUSxLQUFLO0lBRzFDLFlBQVksT0FBZSxFQUFFLElBQVU7UUFDbkMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxxQkFBcUIsQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUFSRCxrREFRQztBQVdNLEtBQUssVUFBVSxZQUFZLENBQUMsT0FBb0I7SUFFbkQsTUFBTSxLQUFLLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWpELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxtQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMxRDtLQUNKO0lBRUQsTUFBTSxHQUFHLEdBQUc7OztHQUdiLENBQUE7SUFFQyxPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQWhCRCxvQ0FnQkM7QUFFTSxLQUFLLFVBQVUsVUFBVSxDQUFDLE9BQWU7SUFDNUMsTUFBTSxHQUFHLEdBQUc7O0dBRWIsQ0FBQTtJQUVDLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQU5ELGdDQU1DO0FBRU0sS0FBSyxVQUFVLFVBQVUsQ0FBQyxPQUFlLEVBQUUsV0FBbUI7SUFDakUsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJYixDQUFBO0lBRUMsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQVJELGdDQVFDIn0=