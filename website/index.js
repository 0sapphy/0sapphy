const app = require('express')();
const path = require('node:path');
const bodyParser = require('body-parser');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `${generateRandomString(5)}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

app.use(require('express').static('public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
//process.loadEnvFile('.env');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'));

app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/upload/:token', (req, res) => {
    const { token } = req.params;
    if (!token) return res.status(404).send('Request failed. :0');
    if (token != process.env.ATOKEN) return res.status(404).send('Request failed. :1');
    res.render('upload');
});

app.get('/i/raw/:name', (req, res) => {
    const { name } = req.params;
    return res.sendFile(path.join(__dirname, `uploads/${name}`));
});

app.get('/i/prev/:name', (req, res) => {
    const { name } = req.params;
    res.render('preview', {
        image: url(req, `/i/raw/${name}`),
        name
    })
})

app.post('/upload', upload.single('image'), (req, res) => {
    const { file } = req;
    if (!file) return res.status(404).send('Invalid body');

    return res.json({
        name: req.file.filename,
        size: req.file.size,
        data: {
            raw: url(req, `/i/raw/${req.file.filename}`)},
            prev: url(req, `/i/prev/${req.file.filename}`)
    });
});

app.listen(3000, () => {
    console.info(`[INFO]: Loaded webserver on port 3000`);
});

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }

    return result;
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {*} path 
 * @returns 
 */
function url(req, path) {
    console.log(req.headers["x-forwarded-host"])
    const host = req.headers["x-forwarded-host"];
    return `${req.protocol}://${host}${path}`;
}
