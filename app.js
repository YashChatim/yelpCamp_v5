const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// importing files
var Campground = require("./models/campground.js"); // ./ - references the current directory
var Comment = require("./models/comment.js");
var seedDB = require("./seeds.js");


mongoose.connect("mongodb://localhost/yelp_camp_v5", { useNewUrlParser: true }); // connected to yelp_camp_v5 database
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); // __dirname - directory where script was run
seedDB();


// Root route
app.get("/", (req, res) => { // replace function with => arrow function in es6
    res.render("landing.ejs");
});


// INDEX route - show all campgrounds
app.get("/campgrounds", (req, res) => {
    // get all campgrounds from database
    Campground.find({}, (err, allCampgrounds) => { // {} finds everything
        if(err) {
            console.log(err);
        }
        else {
            res.render("campgrounds/index.ejs", {campgrounds: allCampgrounds}); // {campgrounds: allCampgrounds} the contents of allCampgrounds is sent to campgrounds which is furthur used in index.ejs 
        }
    });
});


// CREATE route - add to campground to database
app.post("/campgrounds", (req, res) => {
    // getting data from the form and adding to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCamp = {name: name, image: image, description: description}
    
    // create new campground and save to database
    Campground.create(newCamp, (err, newlyCreated) => {
        if(err) {
            console.log(err);
        }
        else {
            res.redirect("/campgrounds"); // redirecting back to campgrounds page
        }
    });
});


// NEW route - show form to create new campground
app.get("/campgrounds/new", (req, res) => { // campgrounds/new will then send the data to the post route
    res.render("campgrounds/new.ejs");
});


// SHOW route - displays additional info for a specific campground
app.get("/campgrounds/:id", (req, res) => {
    // find campground with given ID
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => { // findById - finds the collection by unique ID, populate - populates the comments field, find the correct data, and stick it in comments array, exec - starts the query
        if(err) {
            console.log(err);
        }
        else {
            console.log(foundCampground);
            res.render("campgrounds/show.ejs", {campground: foundCampground}); // render show.ejs with found Campground
        }
    });
});


// Comments routes

// NEW comment route
app.get("/campgrounds/:id/comments/new", (req, res) => {
    // find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render("comments/new.ejs", {campground: campground});
        }
    });
});


// CREATE comment route
app.post("/campgrounds/:id/comments", (req, res) => {
    // lookup campground using id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                }
                else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){ // process.env.PORT, process.env.IP  - environmental viriables set up for cloud9 which we access
    console.log("Server started");
});