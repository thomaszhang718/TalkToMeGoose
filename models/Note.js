// require mongoose
var mongoose = require('mongoose');
// create a schema class
var Schema = mongoose.Schema;

// create the Note schema
var NoteSchema = new Schema({
  // this id is for the article id, not the note id
  id: {
    type:String,
    required:true
  },
  // this is the text of the note
  note: {
    type:String,
    required:true
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the notes.
// These ids are referred to in the Article model.

// create the Note model with the NoteSchema
var Note = mongoose.model('Note', NoteSchema);

// export the Note model
module.exports = Note;