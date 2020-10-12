const railsRoutes = require('./rails');
const railRoutes = require('./rail');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

function getDataByType (type, mainAsset) {
    const assetPath = path.join(__dirname, '../data/assets');
    switch (type) {
        case 'ondemand':
            return require(`${assetPath}/OnDemand_1.json`);
        case 'highlights':
            return require(`${assetPath}/Highlights_1.json`);
            case 'condensed':
            const condensedData = require(`${assetPath}/Highlights_2.json`)
            return {
                ...condensedData,
                Type: 'Condensed',
            };
        case 'live':
            return require(`${assetPath}/Live_1.json`);
        case 'catchup':
            return require(`${assetPath}/CatchUp_1.json`);
        default:
            return null;
    }
}

const appRouter = (app, fs) => {
    app.use(cors());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/', (req, res) => {
        res.send('welcome to api server');
    });

    app.post('/create_asset', (req, res) => {
        const mainAssetData = getDataByType(req.body.mainAsset);
        const relatedAssetsData = req.body.relatedAssets.map((item) => getDataByType(item));

        mainAssetData.Id = `${mainAssetData.Id}${(new Date()).getTime()}`;
        mainAssetData.AssetId = req.body.metadata.assetId || mainAssetData.AssetId;
        mainAssetData.Title = req.body.metadata.title || mainAssetData.Title;
        mainAssetData.Related = relatedAssetsData;

        let railJsonData;

        if (req.body.rail) {
            railJsonData = JSON.parse(fs.readFileSync(`src/data/rail/${req.body.rail}`));
            railJsonData.Tiles.unshift(mainAssetData);
            fs.writeFileSync(`src/data/rail/${req.body.rail}`, JSON.stringify(railJsonData, null, 4));
        }

        fs.writeFileSync(`src/data/assets/${req.body.filename}`, JSON.stringify(mainAssetData, null, 4));
    });

    app.post('/create_rail', (req, res) => {
        const data = {
            Id: 'TestRail',
            Title: 'Test Rail haha',
            Params: null,
            Tiles: []
        };

        data.Id = req.body.filename.replace(/\.json$/, '');
        data.Title = req.body.title;

        req.body.tiles.forEach((item) => {
            data.Tiles.push(require(`../data/assets/${item}`))
        });
        fs.writeFileSync(`src/data/rail/${req.body.filename}`, JSON.stringify(data, null, 4));
        res.send('ok')
    });

    app.post('/create_rails', (req, res) => {
        const data = {
            Rails: [],
            RefreshInterval: 120,
        };

        req.body.rails.forEach((item) => {
            const railData = {
                Id: item,
                "Params": "PageType:home;ContentType:None;TestMode:True",
                "Authorized": false,
                "Service": "Rail",
                "MinRefreshInterval": 120,
                "IsFreeToView": false          
            };
            data.Rails.push(railData);
        });

        fs.writeFileSync(`src/data/rails/${req.body.filename}`, JSON.stringify(data, null, 2));
    });

    app.post('/create_asset_from_rail', (req, res) => {
        console.log('[create asset from rail]')
        const filesCount = {};

        req.body.Tiles.forEach((item, index) => {
            if (!filesCount[item.Type]) {
                filesCount[item.Type] = 1;
            } else if (filesCount[item.Type] < 11) {
                filesCount[item.Type] += 1;
            } else {
                return;
            }

            fs.writeFileSync(
                `src/data/assets/${item.Type}_${filesCount[item.Type]}.json`,
                JSON.stringify(item, null, 4)
            );
        });



        res.send('Got it');
    });

    app.get('/get_available_rails', (req, res) => {
        fs.readdir(path.join(__dirname, '../data/rail'), (err, files) => {
            if (err) {
                console.log(err);
                res.send([]);
                return;
            }
            res.send(files);
        });
    });

    app.get('/get_available_assets', (req, res) => {
        fs.readdir(path.join(__dirname, '../data/assets'), (err, files) => {
            if(err) {
                console.log(err);
                res.send([]);
            }
            res.send(files);
        });
    });

    app.get('/get_rail_assets', (req, res) => {
        let assets = [];

        fs.readFile(
            path.join(__dirname, `../data/rail/${req.query.railId}.json`),
            (err, data) => {
                assets = JSON.parse(data).Tiles.map((item) => ({
                    title: item.Title,
                    type: item.Type
                }));

                res.json({
                    assets
                })
        
            }
        );
    });

    app.get('/get_asset', (req, res) => {
        fs.readFile(
            path.join(__dirname, `../data/assets/${req.query.fileId}.json`),
            (err, data) => {
                if (err) {
                    res.send('[Error]');
                }
                asset = JSON.parse(data);
                res.json(asset);
            }
        )
    });

    railsRoutes(app, fs);
    railRoutes(app, fs);
};

module.exports = appRouter;