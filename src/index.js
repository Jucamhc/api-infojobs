const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const express = require('express');
const cors = require('cors');
const app = express();
const cvinfo = require('./cvInfo'); // Importa cvInfo.js sin la extensión .js

const myHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36",
    "Authority": "www.infojobs.net",
    "Method": "GET",
    "Scheme": "https",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en,es-419;q=0.9,es-ES;q=0.8,es;q=0.7,en-US;q=0.6,es-CO;q=0.5,en-ZA;q=0.4,en-AU;q=0.3,en-CA;q=0.2,en-GB;q=0.1",
    "Cache-Control": "max-age=0"
}

const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
    agent: new https.Agent({
        minVersion: 'TLSv1.3',
        maxVersion: 'TLSv1.3'
    })
};


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {

    res.send("<h1> API INFOJOBS </h1>" +
        "<p>" +
        "<h2>/filtradoSkill</h2>" +
        "Encontraras el array de mi hoja de vida y al final hay un clave con el nombre filtradoSkill con todos </p> <p> los skill de empleos y skill puestos en su hoja de vida se filta por medio de la funcion buscarCoincidencias</p>");

})

app.get('/filtradoSkill', (req, res) => {


    function buscarCoincidencias(cvinfo) {
        const cvSkills = [
            ...cvinfo[0].skills.entries.map((entry) => entry.skill),
            ...cvinfo[0].experiences.entries.flatMap((entry) =>
                entry.skills.map((skill) => skill)
            ),
        ];

        const uniqueSkills = cvSkills.filter((skill, index) => {
            return cvSkills.indexOf(skill) === index;
        });

        console.log(uniqueSkills);

        return uniqueSkills
    }


    const resultados = buscarCoincidencias(cvinfo);
    //console.log(resultados)

    cvinfo[0].filtradoSkill = resultados

    res.send(cvinfo);

});


app.get('/api-offers/search', async (req, res) => {

    const keyword = req.query.keyword || '';
    const normalizedJobTitleIds = req.query.normalizedJobTitleIds || '';
    const provinceIds = req.query.provinceIds || '';
    const cityIds = req.query.cityIds || '';
    const teleworkingIds = req.query.teleworkingIds || '';
    const categoryIds = req.query.categoryIds || '';
    const workdayIds = req.query.workdayIds || '';
    const educationIds = req.query.educationIds || '';
    const segmentId = req.query.segmentId || '';
    const contractTypeIds = req.query.contractTypeIds || '';
    const page = req.query.page || '1'; // Valor predeterminado de la página: 1
    const sortBy = req.query.sortBy || 'PUBLICATION_DATE'; // Valor predeterminado de la ordenación: PUBLICATION_DATE
    const onlyForeignCountry = req.query.onlyForeignCountry || 'false'; // Valor predeterminado: false
    const countryIds = req.query.countryIds || '';
    const sinceDate = req.query.sinceDate || 'ANY'; // Valor predeterminado: ANY
    const subcategoryIds = req.query.subcategoryIds || '';

    //console.log(keyword);


    try {

        const response = await fetch(`https://www.infojobs.net/webapp/offers/search?keyword=${keyword}&normalizedJobTitleIds=${normalizedJobTitleIds}&provinceIds=${provinceIds}&cityIds=${cityIds}&teleworkingIds=${teleworkingIds}&categoryIds=${categoryIds}&workdayIds=${workdayIds}&educationIds=${educationIds}&segmentId=${segmentId}&contractTypeIds=${contractTypeIds}&page=${page}&sortBy=${sortBy}&onlyForeignCountry=${onlyForeignCountry}&countryIds=${countryIds}&sinceDate=${sinceDate}&subcategoryIds=${subcategoryIds}`, requestOptions);

        console.log(response);
        if (!response.ok) {
            throw new Error('Error en la petición');
        }

        let data = await response.json();

        function buscarCoincidencias(cvinfo, offers) {
            const cvSkills = [
                ...cvinfo[0].skills.entries.map((entry) => entry.skill),
                ...cvinfo[0].experiences.entries.flatMap((entry) =>
                    entry.skills.map((skill) => skill)
                ),
            ];

            const uniqueSkills = cvSkills.filter((skill, index) => {
                return cvSkills.indexOf(skill) === index;
            });
            console.log(uniqueSkills);


            const updatedOffers = offers.map((offer) => {
                const description = offer.description.toLowerCase();
                let score = 0;

                uniqueSkills.forEach((skill) => {
                    if (description.includes(skill.toLowerCase())) {
                        score += 1;
                    }
                });

                return { ...offer, score };
            });

            return updatedOffers
        }


        const offers = buscarCoincidencias(cvinfo, data.offers);
        data.offers = offers;


        res.status(200).send(data);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
})

app.get('/api_profile/:id', async (req, res) => {

    const API = 'https://platzi.com/p/';

    /*------------------- VARIABLES  ----------------------*/

    let arrayCertificateRegex = /window\.data\s*=\s*\{([\s\S]*?)\};/;
    let reg_username_careers = /"username":\s*"(\w+)",\s*([\s\S]*?)"careers":\s*\[(.*?)\]/s;
    let reg_username_profile_url = /"username"\s*:\s*"([^"]+)".*?"profile_url"\s*:\s*"([^"]+)"/s;
    let arrayCertificateRegexCurses = /courses:\s*\[\s*{.*?},?\s*\]/i;
    let regexCurses = /\[[^\]]*\]/i;
    let b = 0;
    let firstResponse = { status: 900 };

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        agent: new https.Agent({
            minVersion: 'TLSv1.3',
            maxVersion: 'TLSv1.3'
        })
    };

    try {
        const user = req.params.id;

        if (b === 0) {
            b++;
            await firstFetch(user);
        } else {
            await secondFetch(user);
        }

        async function firstFetch(user) {
            firstResponse = await fetch(`${API}${user}/`, requestOptions);

            if (firstResponse.status !== 200) {
                return res.status(firstResponse.status).send("El usuario no existe en la base de datos.");
            }

            consult(firstResponse);
        }

        async function secondFetch(user) {
            const secondResponse = await fetch(`${API}${user}/`, {
                ...requestOptions,
                headers: {
                    Cookie: firstResponse.headers.get('set-cookie'),
                    'Cache-Control': 'no-cache',
                },
            });

            if (secondResponse.status !== 200) {
                await firstFetch(user);
            }

            consult(secondResponse);
        }

        async function consult(consult) {

            try {

                let respuesta = await consult.text();
                let matches = arrayCertificateRegex.exec(respuesta);

                if (matches?.length >= 1) {
                    let corchetes = matches[1]?.replace(/\'/g, "\"");
                    let matchesCursos = arrayCertificateRegexCurses?.exec(respuesta);
                    let jsonCourses = JSON.parse(regexCurses?.exec(matchesCursos));

                    let jsonData = JSON.stringify(`{${corchetes}}`);
                    jsonData = jsonData.replace(/(['"])?([a-zA-Z0-9]+)(['"])?:/g, '"$2": ');
                    jsonData = jsonData.replace(/\\n/g, "");
                    jsonData = jsonData.replace(/\\/g, '');
                    jsonData = jsonData.trim().substring(1, jsonData.length - 1);
                    jsonData = jsonData.trim().substring(1, jsonData.length - 1);
                    jsonData = jsonData.replace(/"https": \/\/+/g, '"https://');
                    jsonData = jsonData.replace('profile_"url":', '"profile_url":');
                    jsonData = jsonData.replace('"Twitter":', 'Twitter:');
                    jsonData = jsonData.replace('"Instagram":', 'Instagram:');
                    jsonData = jsonData.replace('"http":', '"http:');
                    jsonData = jsonData.replace('."1":', '.1:');

                    let jsonData_username_careers = reg_username_careers.exec(jsonData);

                    if (null != jsonData_username_careers) {
                        jsonData_username_careers = JSON.parse("{" + jsonData_username_careers[0] + "}");
                        jsonData_username_careers.courses = jsonCourses;
                        console.log(jsonData_username_careers.username);
                        res.send(jsonData_username_careers);
                    } else {
                        let jsonData_username_profile_url = reg_username_profile_url.exec(jsonData);
                        jsonData_username_profile_url = JSON.parse("{" + jsonData_username_profile_url[0] + "}");
                        jsonData_username_profile_url.courses = jsonCourses;
                        console.log(jsonData_username_profile_url.username);
                        res.status(200).send(JSON.stringify(jsonData_username_profile_url));
                        /*  res.setHeader('Content-Type', 'application/json');
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); */
                    }
                } else {
                    let matchesCursos = arrayCertificateRegexCurses.exec(respuesta);
                    let jsonCourses = regexCurses.exec(matchesCursos);
                    let curses = [];
                    if (jsonCourses != null) {
                        curses = JSON.parse(jsonCourses[0]);
                        res.status(200).send(JSON.stringify({ curses: curses }));
                    }
                    res.send("THE PROFILE IS PRIVATE OR YOUR PROFILE HAVE OTHER PARAMETER");
                }
            } catch (error) {
                console.log(error);
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Escuchando en el puerto ${PORT}`));

