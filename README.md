# API per la Ronda della Carità di Verona

[![Node.js CI](https://github.com/andreacanton/ronda-api/actions/workflows/node.js.yml/badge.svg)](https://github.com/andreacanton/ronda-api/actions/workflows/node.js.yml)

Per far partire l'ambiente di sviluppo

far partire il server database (es. con Homebrew su mac)

```shell
brew services start mysql
```

installare i moduli di node

```shell
npm install
```

far fare eventuali migrazioni

```shell
npm run db:migrate
```

Generare le chiavi rsa con i seguenti comandi.

Per la chiave privata

```shell
openssl genrsa -out private_key.pem 2048
```

Per la chiave pubblica:

```shell
openssl rsa -in private_key.pem -outform PEM -pubout -out public_key.pem
```

metterle nella cartella `authorization` e leggibili solo localmente.
Infine far partire il server node

```shell
npm start
```

