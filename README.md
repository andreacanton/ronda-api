# API per la Ronda della Carità di Verona

Per far partire l'ambiente di sviluppo

far partire il server database (es. con Bower su mac)

```shell
bower services start mysql
```

far fare eventuali migrazioni

```
npm run db:migrate
```

Infine far partire il server node

```shell
npm start
```

## Chiavi RS

per generare le chiavi rsa eseguire i seguenti comandi.

Per la chiave privata

```shell
openssl genrsa -out private_key.pem 2048
```

Per la chiave pubblica:

```shell
openssl rsa -in private_key.pem -outform PEM -pubout -out public.pem
```

metterle nella cartella `authorization` e leggibili solo localmente.
