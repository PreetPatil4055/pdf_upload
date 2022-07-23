require("views/index.ejs");
require(".env");
const express = require('express');
const path = require('path');
const crypto = require('crypto');

const mongoose = require('mongoose');
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');

const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');


const app = express();
//Middleware
app.use(bodyParser.json());

app.use(methodOverride('_method'));
//mongo uri
const MONGODB_URI = 'mongodb+srv://preet:1234@cluster0.ih2rd.mongodb.net/?retryWrites=true&w=majority';

//create connection
const conn = mongoose.createConnection(MONGODB_URI);
//init gfs

let gfs;
conn.once('open', () => {
    //init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

//create storage engine
const storage = new GridFsStorage({
    url: MONGODB_URI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

  // @route get /
  // @desc Loads from
  
  
app.set('view engine', 'ejs');

app.get('/', (req, res)=> {
    res.render('index');
});

//@route Post /upload
//@desc upload files yo desc
app.post('/upload', upload.single('file'), (req, res)  => {
res.redirect('/');
  //res.json({file: req.file});
});

//@route get /giles
//@desc display files in json
app.get('/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    if(!files || files.length === 0){
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // files exist
    return res.json(files);
  });
});

const port = 5000;
app.listen(port, () =>
console.log(`Port established ${port}`)
);
