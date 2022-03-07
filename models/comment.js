const mongoose = require("mongoose")

var commentSchema = mongoose.Schema({
    _postID: mongoose.SchemaTypes.ObjectId,
	commentContent: String,
	commentAuthor: String,
	commentDateString: String,
	commentDate: Date,
	commentScore: Number,
	nestedComments: [mongoose.SchemaTypes.ObjectId],
	upvoteComment:[String],
	downvoteComment:[String]
})

var Comment = mongoose.model("commentList",commentSchema)

exports.get = function (id) {
	return new Promise(function (resolve, reject) {
		Comment.findOne({
			_id: id
		}).then((comment) => {
			resolve(comment)
		}, (err) => {
			reject(err)
		})
	})
}

exports.deleteComment = function(commentID){
	return new Promise(function (resolve, reject) {

		var deleteComments = []

		function removeNested(commentID){
			return new Promise(function (resolve, reject) {
				Comment.findOne({
					_id: commentID
				}).then((comment)=>{
					try{
						for(let i = 0 ; i < comment.nestedComments.length ; i++){
							removeNested(comment.nestedComments[i]._id).then((commentID)=>{});
						}
					}catch(e){}
					Comment.remove({
						_id: commentID
					}).then((result) => {
						deleteComments.push(commentID)
						resolve(result)	
					})
				})
			})
		}

		removeNested(commentID).then((result)=>{
			Comment.countDocuments().then((maxComment)=>{
				for(let i = 0 ; i < maxComment ; i++){
					Comment.findOne().skip(i).then((comment)=>{
						try{
							for(let i = 0 ; i < comment.nestedComments.length ; i++){
								if(comment.nestedComments[i]._id.equals(commentID)){
									comment.nestedComments[i].splice(i, 1);
								}
							}
							comment.save().then((result2)=>{})
						}catch(e){}

					})
				}
				resolve(deleteComments)
			})
		});


	})
}

exports.deleteCommentFromPost = function(postID){
	return new Promise(function (resolve, reject) {
		Comment.find({
			_postID: postID
		}).then((deletedComments) => {
			Comment.remove({
				_postID: postID
			}).then((result) => {
				resolve(deletedComments)
			}, (err) => {
				reject(err)
			})
		}, (err) => {
			reject(err)
		})

	})
}

exports.updateComment = function(commentID, commentContent){
	return new Promise(function (resolve, reject) {
		Comment.findOneAndUpdate({
			_id: commentID
		},{
			commentContent
		}).then((newComment) => {
		//	resolve(newComment)
		}, (err) => {
			reject(err)
		})
	})
}

exports.put = function (comment) {
	return new Promise(function (resolve, reject) {
		var c = new Comment(comment)
		c.save().then((newComment)=>{
			resolve(newComment)
		}, (err)=>{
			reject(err)
		})
	})
}

exports.putNested = function (comment, commentID) {
	return new Promise(function (resolve, reject) {
		var c = new Comment(comment)
		c.save().then((newComment)=>{
			Comment.findOneAndUpdate({
				_id: commentID
			}, {
				$push: {nestedComments: newComment._id}
			}).then((msg)=>{
				resolve(newComment)
			}, (err)=>{
				reject(err)
			})
		}, (err)=>{
			reject(err)
		})

	})
}