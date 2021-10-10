const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  count: Number,
  log: [{description: String, duration: Number, date: String}],
})

const user = mongoose.model('user', userSchema);

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
        res.json({username: data.username, _id: data._id})
      }
    })
  })

app.post('/api/users/:id/exercises', (req, res) => {
  user.findById(req.params.id, (err, userData) => {
    if (err) {
      res.json({ error: err });
    } else {
      const newExercise = {description: req.body.description, duration: req.body.duration}
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
          res.json({_id: data._id, username: data.username, date: newExercise.date, duration: parseInt(newExercise.duration), description: newExercise.description});
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
      let finalData1 = [];
      if (req.params.from) {
        for (let i = 0; i < data.log.length; i++) {
          if (data.log[i].date >= req.params.from){
            finalData1.push(data.log[i]);
          };
        };
      } else {
        finalData1 = data.log;
      };
      let finalData2 = [];
      if (req.params.to) {
        for (let i = 0; i < finalData1.length; i++) {
          if (finalData1[i].date <= req.params.to) {
            finalData2.push(finalData1[i]);
          };
        };
      } else {
        finalData2 = finalData1;
      }
      let finalData3 = [];
      if (req.params.limit){
        console.log(req.params.limit);
        added = 0;
        for (let i = 0; i < finalData2.length; i++) {
          if (added < req.params.limit){
            finalData3.push(data.log[i]);
            added++;
          };
        };
      } else {
        finalData3 = finalData2;
      }
      data.log = finalData3
      res.json(data);
    }
  })
})





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
