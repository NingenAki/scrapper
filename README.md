# HTML Scrapper

Baixa o conteúdo HTML de uma URL e salva em um arquivo local.

## Requisitos

- Node.js 18 ou superior

## Uso

```bash
npm run scrape -- https://example.com
```

Por padrão, o conteúdo é salvo em `output.html`. Para escolher outro caminho:

```bash
npm run scrape -- https://example.com paginas/example.html
```

O programa valida o protocolo da URL, verifica respostas HTTP com erro e cria automaticamente as pastas do arquivo de saída.
