
exports.doc = {
  "_id": "_design/user",
  "views": {
    "byemail": {
      "map": "function(doc) { emit(doc.email, doc._id); }"
    }
  }
}
