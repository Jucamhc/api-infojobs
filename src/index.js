const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const express = require('express');
const cors = require('cors');
const app = express();


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hola, busca');
});


app.get('/api-offers/:frace/:paguina', async (req, res) => {

    const frace = req.params.frace;
    const paguina = req.params.paguina;

    fetchData(frace, paguina);

    async function fetchData(frace, paguina) {
        try {

            const myHeaders = new Headers();
            myHeaders.append("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36");
            myHeaders.append("Authority", "www.infojobs.net");
            myHeaders.append("Method", "GET");
            myHeaders.append("Scheme", "https");
            myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
            myHeaders.append("Accept-Encoding", "gzip, deflate, br");
            myHeaders.append("Accept-Language", "en,es-419;q=0.9,es-ES;q=0.8,es;q=0.7,en-US;q=0.6,es-CO;q=0.5,en-ZA;q=0.4,en-AU;q=0.3,en-CA;q=0.2,en-GB;q=0.1");
            myHeaders.append("Cache-Control", "max-age=0");

            const requestOptions = {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
                agent: new https.Agent({
                    minVersion: 'TLSv1.3',
                    maxVersion: 'TLSv1.3'
                })
            };

            const response = await fetch(`https://www.infojobs.net/webapp/offers/search?keyword=${frace}&page=${paguina}&sortBy=PUBLICATION_DATE&onlyForeignCountry=false&countryIds=&sinceDate=ANY`, requestOptions);
            if (!response.ok) {
                throw new Error('Error en la petición');
            }
            let data = await response.json();
            console.log(data.offers.length);
            res.status(200).send(data);

        } catch (error) {
            console.error(error);
            res.status(500).send('Error en el servidor');
        }
    }
})

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Escuchando en el puerto ${PORT}`));