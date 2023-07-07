var express = require("express");
var app = express();
var db = require("./database.js");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000;
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
});

app.get("/", (req, res, next) => {
  res.json({ message: "Ok" });
});

app.get("/boards", (req, res, next) => {
  var sql = "select * from boards";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      data: rows,
    });
  });
});

app.post("/boards", (req, res) => {
  var { title } = req.body;

  var data = {
    title: title,
    stage: 1,
  };
  var sql = "INSERT INTO boards (title, stage) VALUES (?,?)";
  var params = [data.title, data.stage];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(201);
    data.id = this.lastID;
    res.json(data);
  });
});

app.put("/boards/:id", (req, res) => {
  var id = req.params.id;
  var { stage } = req.body;
  var acceptedStages = [1, 2, 3];
  if (acceptedStages.includes(stage)) {
    db.run(
      `UPDATE boards set 
           stage = COALESCE(?,stage) 
           WHERE id = ?`,
      [stage, id],
      function (err, result) {
        if (err) {
          res.status(400).json({ error: res.message });
          return;
        }
        var sql = "select * from boards where id=?";
        var params = [id];
        db.all(sql, params, (err, rows) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
          res.status(200);
          res.json(rows[0]);
        });
      }
    );
  } else {
    res.status(400).json({ error: res.message });
    return;
  }
});

// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});
