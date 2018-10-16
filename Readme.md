# Aperitech dashboard

Questo repository contiene il codice sorgente del sito web con le analytics Aperitech dei meetup romani.

# Setup

Questa applicazione è composta di 3 parti: un database, un web server con GraphQL ed un frontend.

Per avviare l'intera applicazione viene utilizzato `docker` e `docker-compose` che imposterà i vari ambienti necessari per far funzionare l'app.

Il seguente comando costruirà l'ambiente per l'applicazione:

```
docker-compose up -d
```

A questo punto saranno raggiungibili su `localhost` nel browser:

- il DB Neo4J sulle porte `7474` (REST) e `7687` (Bolt)
- il webserver GraphQL Apollo sulla porta `4000`
- il frontend in React sulla porta `3000`

