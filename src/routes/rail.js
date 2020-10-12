const path = require('path');
const { get } = require('object-path');
const cors = require('cors');

const railRoutes = (app, fs) => {
    let dataPath;


    app.get("/rail", cors(), (req, res) => {

        const railId = get(req, 'query.id', '');
        if (!railId) {
            res.send('Rail ID is not found.');
            return;
        }

        dataPath = path.join(__dirname, `../data/rail/${railId}.json`);

        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            res.send(JSON.parse(data));
        });
    });
};

module.exports = railRoutes;