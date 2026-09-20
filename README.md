# Royal Road Scraper

Downloads a work published on Royal Road, extracts the synopsis and chapters, and generates an EPUB ebook inside the `books` folder.

## Requirements

- Node.js 18 or higher
- Dependencies installed with `npm install`

## Usage

```bash
npm run scrape -- https://www.royalroad.com/fiction/12345/story-name
```

The program expects a Royal Road story URL. From that URL, it:

- validates the URL and accepts only `http` and `https`
- downloads the work page
- fetches the book cover and saves it as `books/cover.jpg` when available
- reads the story summary
- iterates through the chapters until the end of the story
- generates an EPUB file at `books/<Story_Title>.epub`

## Output

Files are saved in the `books/` folder, and the folder is created automatically if it does not already exist.

Example output:

```text
books/
├── cover.jpg
├── The_Example_Story.epub
└── ...
```

## Notes

- The script was written specifically for Royal Road and is not a generic scraper for every website.
- The URL must point to the work page, not to a single chapter.
- The program checks HTTP errors and stops with a clear message if the page cannot be accessed.
