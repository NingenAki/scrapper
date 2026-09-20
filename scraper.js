#!/usr/bin/env node
import FileSystem from "fs";
import { JSDOM } from "jsdom";
import Epub from "epub-gen";
const BASE_URL = "https://www.royalroad.com";

function printUsage() {
  console.error("Uso: npm run scrape -- <url>");
}

function getURL(path) {
  let url;
  try {
    url = new URL(path);
  } catch {
    throw new Error(`URL inválida: ${path}`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("A URL deve usar o protocolo http ou https.");
  }
  return url;
}

async function getPage(url) {
  const urlObject = getURL(String(url));
  const response = await fetch(urlObject, {
    headers: {
      "User-Agent": "html-scrapper/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao baixar a página: ${response.status} ${response.statusText}`,
    );
  }

  return await response.text();
}

async function getChapter(link) {
  if (link === null) {
    return null;
  }

  const url = getURL(`${BASE_URL}${link}`);
  const html = await getPage(url);
  const doc = new JSDOM(html).window.document;
  const title = doc.querySelector(".fic-header h1")?.textContent?.trim() ?? "";
  const navButtons = doc.querySelector(".nav-buttons");
  const next = navButtons?.getElementsByClassName("btn")?.[1]?.getAttribute("href") ?? null;
  console.log(`Baixando capítulo: ${title}`);
  const content = doc.querySelector(".chapter-content");
  const body = [...content.childNodes].reduce((acc, child) => {
    if (child.tagName === "SPAN") {
      console.log(child.innerText);
      return acc;
    }

    return child.innerHTML ? `${acc}<p>${child.innerHTML}</p>` : acc;
  }, "");
  return { title, body, next };
}

function parseArguments(argv = process.argv.slice(2)) {
  const [urlArgument] = argv;

  if (!urlArgument) {
    printUsage();
    process.exitCode = 1;
    return null;
  }

  return getURL(urlArgument);
}

async function scrape() {
  const url = parseArguments();
  if (!url) return;

  const html = await getPage(url);

  const doc = new JSDOM(html).window.document;
  const header = doc.querySelector(".fic-header");
  const cover = header
    .querySelector(".cover-art-container > img")?.getAttribute("src");
  const link = header.querySelector(".fic-buttons > a").getAttribute("href");
  const title = header.getElementsByTagName("h1")[0].textContent.trim();
  const author = header
    .getElementsByTagName("h4")[0]
    .getElementsByTagName("a")[0]
    .textContent.trim();
  const description = doc.querySelector(
    ".description > .hidden-content",
  ).innerHTML;

  FileSystem.mkdirSync("books", { recursive: true });
  if (cover) {

    const img = await fetch(cover);
    const coverBlob = await img.blob();
    const coverArrayBuffer = await coverBlob.arrayBuffer();
    const coverBuffer = Buffer.from(coverArrayBuffer);

    FileSystem.writeFileSync("books/cover.jpg", coverBuffer);
  }

  const option = {
    title: title,
    author: author,
    publisher: "Royal Road",
    cover: cover ? "books/cover.jpg" : undefined,
    content: [{
      title: "Summary",
      data: description,
      beforeToc: true,
      excludeFromToc: true,
    }],
  };
  let chapter = await getChapter(link);
  do {
    option.content.push({
      title: chapter.title,
      data: chapter.body,
    });
    chapter = await getChapter(chapter.next);
  } while (chapter);

  const book = new Epub(option, `books/${title.replaceAll(" ", "_")}.epub`);
  book.promise.then(() => {
    console.log("Ebook gerado com sucesso!");
  });
}

scrape().catch((error) => {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
});
