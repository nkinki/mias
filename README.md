# MI Asszisztens

Ez egy modern, React alapú mesterséges intelligencia asszisztens alkalmazás, amely a Google Gemini API-t használja.

## Telepítés és Futtatás Helyileg

1.  Klónozd a repót vagy töltsd le a fájlokat.
2.  Telepítsd a függőségeket:
    ```bash
    npm install
    ```
3.  Hozz létre egy `.env` fájlt a gyökérkönyvtárban, és add meg a Google AI Studio-ból szerzett API kulcsodat:
    ```
    API_KEY=IDE_MASOLD_A_KULCSOT
    ```
4.  Indítsd el a fejlesztői szervert:
    ```bash
    npm run dev
    ```

## Feltöltés GitHub-ra

1.  Inicializáld a git-et:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Hozz létre egy új repót GitHub-on.
3.  Kösd össze és töltsd fel:
    ```bash
    git remote add origin https://github.com/FELHASZNALONEV/REPO_NEV.git
    git push -u origin main
    ```

## Telepítés Vercel-re

1.  Regisztrálj a [Vercel](https://vercel.com)-en.
2.  Importáld a GitHub repódat.
3.  A "Configure Project" lépésnél az **Environment Variables** részhez add hozzá:
    *   **Key:** `API_KEY`
    *   **Value:** A Google AI API kulcsod.
4.  Kattints a **Deploy** gombra.
