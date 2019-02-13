var db = require("../models");
var authController = require("../controllers/authcontroller.js");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    res.render("signup")
  });

  app.get("/example/:id", function (req, res) {
    db.Example.findOne({
      where: {
        id: req.params.id
      }
    }).then(function (dbExample) {
      res.render("example", {
        example: dbExample
      });
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};