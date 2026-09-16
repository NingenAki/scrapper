#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
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
  const response = await fetch(url, {
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
    return "";
  }

  const url = getURL(`${BASE_URL}${link}`);
  const html = await getPage(url);
  const doc = new JSDOM(html).window.document;
  console.log(`Baixando capítulo: ${title}`);
  const next = doc
    .querySelector(".nav-buttons")
    .getElementsByClassName("btn")[1]
    .getAttribute("href");
  const title = doc.querySelector(".fic-header h1").textContent.trim();
  const content = doc.querySelector(".chapter-content");
  const body = content.getElementsByTagName("p").length
    ? [...content.getElementsByTagName("p")].reduce((acc, p) => {
        const span = p.querySelector("span")?.[0];
        if (span) {
          p = p.removeChild(span);
        }

        return `${acc}<p>${p.innerHTML}</p>\n`;
      }, "")
    : content.innerHTML;
  return { title, body, next };
}

function parseArguments() {
  const [urlArgument, outputArgument = "output.html"] = process.argv.slice(2);

  if (!urlArgument) {
    printUsage();
    process.exitCode = 1;
    return null;
  }

  return { url: getURL(urlArgument), outputPath: resolve(outputArgument) };
}

async function scrape() {
  const arguments_ = parseArguments();
  if (!arguments_) return;

  const html = await getPage(arguments_.url);

  const doc = new JSDOM(html).window.document;
  const header = doc.querySelector(".fic-header");
  const cover = header.querySelector(".cover-art > img").getAttribute("src");
  const link = header.querySelector(".fic-buttons > a").getAttribute("href");
  const title = header.getElementsByTagName("h1")[0].textContent.trim();
  const author = header
    .getElementsByTagName("h4")[0]
    .getElementsByTagName("a")[0]
    .textContent.trim();
  const description = doc.querySelector(
    ".description > .hidden-content",
  ).innerHTML;
  const chapters = await getChapter(link);
  
  const book = new Epub(option, `${title.replaceAll(" ", "_")}.epub`);
  book;
  writeFile(
    `${title.replaceAll(" ", "_")}.html`,
    `<h1>${title}</h1>\n<h3>by: ${author}</h3><br/>\n<div>${description}</div><br/>\n${chapters}`,
    "utf8",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrape().catch((error) => {
    console.error(`Erro: ${error.message}`);
    process.exitCode = 1;
  });
}
