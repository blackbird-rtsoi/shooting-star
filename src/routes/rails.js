const path = require('path');
const cors = require('cors');

const railsRoutes = (app, fs) => {

    const dataPath = path.join(__dirname, '../data/rails/rails.json');

    app.get("/rails", cors(), (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                throw err;
            }
            res.send(JSON.parse(data));
        });
    });
};

module.exports = railsRoutes;