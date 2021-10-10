const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: Date
})

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  count: Number,
  log: [exerciseSchema],
})

const user = mongoose.model('user', userSchema);
const exercise = mongoose.model('exercise', exerciseSchema);

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .get( (req, res) => {
    user.find({}, 'username _id', (err, data) => {
      if (err) {
        res.json({ error: err});
      } else {
        res.json(data);
      }
    })
  })
  .post( (req, res) => {
    const newUser = new user({username: req.body.username, count: 0 })
    newUser.save((err, data) => {
      if (err) {
        res.json({error: err});
      } else {
        res.json(data)
      }
    })
  })

app.post('/api/users/:id/exercises', (req, res) => {
  user.findById(req.params.id, (err, userData) => {
    if (err) {
      res.json({ error: err });
    } else {
      const newExercise = new exercise({description: req.body.description, duration: req.body.duration})
      let exDate;
      if (req.body.date) {
        exDate = new Date(req.body.date);
      } else {
        exDate = new Date;
      }
      newExercise.date = exDate.toDateString();
      userData.log.push(newExercise);
      userData.count++;
      userData.save((err, data) => {
        if (err) {
          res.json({ error: err});
        } else {
          res.json({...data, username: userData.username});
        }
      })
    };
  })
})

app.get('/api/users/:id/logs', (req, res) => {
  user.findById(req.params.id, (err, data) => {
    if (err) {
      res.json({ error: err});
    } else {
      res.json(data);
    }
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
