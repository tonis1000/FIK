const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/save-url', (req, res) => {
    const url = req.body.url;
    fs.appendFile('urls.txt', url + '\n', (err) => {
        if (err) {
            res.status(500).send('Fehler beim Speichern der URL');
        } else {
            res.send('URL erfolgreich gespeichert');
        }
    });
});

app.post('/delete-url', (req, res) => {
    const url = req.body.url;
    fs.readFile('urls.txt', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Fehler beim Lesen der Datei');
            return;
        }
        const urls = data.split('\n').filter(u => u !== url);
        fs.writeFile('urls.txt', urls.join('\n'), (err) => {
            if (err) {
                res.status(500).send('Fehler beim Löschen der URL');
            } else {
                res.send('URL erfolgreich gelöscht');
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
