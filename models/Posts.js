const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// 
var postsSchema = new Schema({
    titulo:String,
    image:String,
    subtitulo:String,
    texto1:String,
    texto2:String,
    texto3:String,
    textointro1:String,
    textointro2:String,
    slug:String,
    autor:String,
    views:Number

},{collection:"posts"})

var Posts = mongoose.model("Posts", postsSchema)

module.exports = Posts;