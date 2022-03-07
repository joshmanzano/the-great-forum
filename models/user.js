const mongoose = require("mongoose")

var userSchema = mongoose.Schema({
	emailAddress: String,
	username: String,
	password: String,
	shortBio: String,
	avatar: String,
	post: [{
		postTitle: {
			type: String,
			required: true,
			minlength: 6,
			trim: true
		},
		postDescription: String,
		postAuthor: String,
		postDateString: String,
		postDate: Date,
		postScore: Number,
		commentNumber: Number,
		comment: [{
			_postID: mongoose.SchemaTypes.ObjectId,
			commentContent: String,
			commentAuthor: String,
			commentDateString: String,
			commentDate: Date,
			commentScore: Number,
			nestedComments: [mongoose.SchemaTypes.ObjectId],
			upvoteComment:[String],
			downvoteComment:[String]
		}],
		upvote:[String],
		downvote:[String]
	}],
	comment: [{
		_postID: mongoose.SchemaTypes.ObjectId,
		commentContent: String,
		commentAuthor: String,
		commentDateString: String,
		commentDate: Date,
		commentScore: Number,
		nestedComments: [mongoose.SchemaTypes.ObjectId],
		upvoteComment:[String],
		downvoteComment:[String]
	}],
})

var User = mongoose.model("userList", userSchema)

exports.get = function (username) {
	return new Promise(function (resolve, reject) {
		User.findOne({
			username
		}).then((user) => {
			resolve(user)
		}, (err) => {
			reject(err)
		})
	})
}

exports.deletePost = function(username, id){
	return new Promise(function(resolve, reject){
		User.findOne({
			username
		}).then((user)=>{
			for(let i = 0; i < user.post.length; i++ ){
				if(user.post[i]._id.equals(id)){
					user.post.splice(i, 1)
				}
			}
			user.save().then((result)=>{
				resolve(user)
			}, (err)=>{
				reject(err)
			})	
		}, (err)=>{
			reject(err)
		})
	})
}

exports.deleteCommentsFromPost = function(postID){
	return new Promise(function(resolve, reject){
		User.countDocuments().then((maxUser)=>{
			for(let i = 0 ; i < maxUser ; i++){
				User.findOne().skip(i).then((user)=>{
					let i = 0
					while(i < user.comment.length){
						console.log(user.username + ": " + user.comment[i]._postID + " == " + postID)
						if(user.comment[i]._postID.equals(postID)){
							user.comment.splice(i, 1);
						}else{
							i++;
						}
					}
					user.save().then((result)=>{
						resolve(result)
					}, (err)=>{
						reject(err)
					})
				})
			}
		})
	})
}

exports.deleteComments = function(post, deletedComments){
	console.log(deletedComments)
	return new Promise(function(resolve, reject){
		User.countDocuments().then((maxUser)=>{
			for(let i = 0 ; i < maxUser ; i++){
				User.findOne().skip(i).then((user)=>{
					for(let j = 0 ; j < deletedComments.length ; j++){
						let i = 0
						while(i < user.comment.length){
							if(user.comment[i]._id.equals(deletedComments[j])){
								user.comment.splice(i, 1);
							}else{
								i++;
							}
						}
						for(let i = 0 ; i < user.post.length ; i++){
							if(user.post[i]._id.equals(post._id)){
								user.post[i].commentNumber = post.commentNumber
							}
						}
						user.save().then((result)=>{
							resolve(result)
						}, (err)=>{
							reject(err)
						})
					}
				})
			}
		})
	})
}

exports.deleteComment = function(username, commentID){
	return new Promise(function(resolve, reject){
		User.findOne({
			username
		}).then((user)=>{
			// deletes in comment array of user
			for(let i = 0; i < user.comment.length; i++){
				if(user.comment[i]._id.equals(commentID)){
					user.comment.splice(i, 1);
				}
			}
			user.save().then((result)=>{
				console.log(commentID + " deleted")
				resolve(result)
			}, (err)=>{
				reject(err)
			})
		})
	})
}

exports.upVoteComment = function (commentID, postID, username) {
	var upexist = 0;
	var downvoteonce = 0;
	return new Promise(function (resolve, reject) {
		User.findOne({
			username
		
		}).then((user) => {

			for(let j =0; j < user.comment.length; j++){
				if(user.comment[j]._id == commentID){


					for(let i = 0; i< user.comment[j].downvoteComment.length; i++){ // checks downvote array if user is there and deletes
						if(user.comment[j].downvoteComment[i] == username){
							user.comment[j].downvoteComment.splice(i, 1);
							downvoteonce = 1;
						}
					}

					for(let i = 0; i< user.comment[j].upvoteComment.length; i++){ 	// checks upvote array, if user already upvoted that post
						if(user.comment[j].upvoteComment[i] == username){
							upexist = 1;
						}
					}

					if(upexist == 0 && downvoteonce == 0){ // wala pa yung username na yun, so can push to array
						user.comment[j].upvoteComment.push(username)
						user.comment[j].commentScore = user.comment[j].commentScore + 1;
		
						user.save().then((newPost)=>{
							resolve(newPost)
						}, (err)=>{
							reject(err)
						})
					}else if(upexist == 0 && downvoteonce == 1){
						user.comment[j].upvoteComment.push(username)
						user.comment[j].commentScore = user.comment[j].commentScore + 2;
		
						user.save().then((newPost)=>{
							resolve(newPost)
						}, (err)=>{
							reject(err)
						})
					}
					else if (upexist == 1){// username already in the array, na upvote na yung post ng user na yun, sends back null
						resolve(null)
					}

				}
			}

		}, (err) => {
			reject(err)
		})
	})
}

exports.downVoteComment = function (commentID, postID, username) {
	var downexist = 0;
	var upvoteonce = 0;

	return new Promise(function (resolve, reject) {
		User.findOne({
			username
		
		}).then((user) => {
			for(let j =0; j < user.comment.length; j++){
				if(user.comment[j]._id == commentID){

					for(let i = 0; i< user.comment[j].upvoteComment.length; i++){ // checks upvote array if user is there and deletes
						if(user.comment[j].upvoteComment[i] == username){
							user.comment[j].upvoteComment.splice(i, 1);
							upvoteonce = 1;
						}
					}

					for(let i = 0; i< user.comment[j].downvoteComment.length; i++){ 	// checks downvote array, if user already upvoted that post
						if(user.comment[j].downvoteComment[i] == username){
							downexist = 1;
						}
					}

					if(downexist == 0 && upvoteonce == 0){ // wala pa yung username na yun, so can push to array
						user.comment[j].downvoteComment.push(username)
						user.comment[j].commentScore = user.comment[j].commentScore - 1;
		
						user.save().then((newPost)=>{
							resolve(newPost)
						}, (err)=>{
							reject(err)
						})
					}else if(downexist == 0 && upvoteonce == 1){
						user.comment[j].downvoteComment.push(username)
						user.comment[j].commentScore = user.comment[j].commentScore - 2;
		
						user.save().then((newPost)=>{
							resolve(newPost)
						}, (err)=>{
							reject(err)
						})
					}
					else if (downexist == 1){// username already in the array, na upvote na yung post ng user na yun, sends back null
						resolve(null)
					}
				}
			}
		}, (err) => {
			reject(err)
		})
	})
}

exports.updateComment = function(username, postID, commentID, commentContent){

	return new Promise(function(resolve, reject){
		User.findOne({
			username
		}).then((user)=>{

			if(user){
			// updates in comment array in the post array of user
			for(let i = 0; i < user.post.length; i++ ){
				if(user.post[i]._id == postID){
					if(user.post[i].comment.length >0){
						for(let j = 0; j<user.post[i].comment.length; j++){
							if(user.post[i].comment[j]._id == commentID){
								user.post[i].comment[j].commentContent = commentContent
							}
						}
					}
				}
			}

			// updates in comment array of user
			for(let i = 0; i < user.comment.length; i++){
				if(user.comment[i]._id == commentID){
					user.comment[i].commentContent = commentContent
				}
			}

			user.save().then((newUser)=>{
				resolve(newUser)
			}, (err)=>{
				reject(err)
			})
		}else{console.log("user is NULL")}
		})
	})
}

exports.upVote = function (id, username, postAuthor) {
	var upexist = 0;
	var downvoteonce = 0;
	var postindex=0;
	return new Promise(function (resolve, reject) {
		User.findOne({
			username:postAuthor
		
		}).then((user) => {
			
			for(let j = 0; j < user.post.length; j++){

				if(user.post[j]._id == id){
					postindex = j;
				}

			// checks downvote array if user is there and deletes 
				for(let i = 0; i< user.post[j].downvote.length; i++){
					if(user.post[j].downvote[i] == username){
						user.post[j].downvote.splice(i, 1);
						downvoteonce = 1;
					}
				}

			// checks upvote array, if user already upvoted that post
				for(let i = 0; i< user.post[j].upvote.length; i++){
					if(user.post[j].upvote[i] == username){
						upexist = 1;
					}
				}

				if(upexist == 0 && downvoteonce == 0){ // wala pa yung username na yun, so can push to array
					user.post[postindex].upvote.push(username)
					user.post[postindex].postScore = user.post[postindex].postScore + 1;
	
				}else if(upexist == 0 && downvoteonce == 1){
					user.post[postindex].upvote.push(username)
					user.post[postindex].postScore = user.post[postindex].postScore + 2;
	
				}
				else if (upexist == 1){// username already in the array, na upvote na yung post ng user na yun, sends back null
					resolve(null)
				}

			}
			user.save().then((newPost)=>{
				resolve(newPost)
			}, (err)=>{
				reject(err)
			})

		

			if(user){
				
			} else{console.log("post IS NULL")}

		}, (err) => {
			reject(err)
		})
	})
}

exports.downVote = function (id, username, postAuthor) {
	var downexist = 0;
	var upvoteonce = 0;
	var postindex=0;
	return new Promise(function (resolve, reject) {
		User.findOne({
			username:postAuthor
		
		}).then((user) => {
		
			for(let j = 0; j < user.post.length; j++){
				if(user.post[j]._id == id){
					postindex = j;
				}

			// checks upvote array if user is there and deletes 
				for(let i = 0; i< user.post[j].upvote.length; i++){
					if(user.post[j].upvote[i] == username){
						user.post[j].upvote.splice(i, 1);
						upvoteonce = 1;
					}
				}

			// checks downvote array, if user already downvoted that post
				for(let i = 0; i< user.post[j].downvote.length; i++){
					if(user.post[j].downvote[i] == username){
						downexist = 1;
					}
				}

				if(downexist == 0 && upvoteonce == 0){ // wala pa yung username na yun, so can push to array
					user.post[postindex].downvote.push(username)
					user.post[postindex].postScore = user.post[postindex].postScore - 1;
	
				}else if(downexist == 0 && upvoteonce == 1){
					user.post[postindex].downvote.push(username)
					user.post[postindex].postScore = user.post[postindex].postScore - 2;
	
				}
				else if (downexist == 1){// username already in the array, na upvote na yung post ng user na yun, sends back null
					resolve(null)
				}

			}
			user.save().then((newPost)=>{
				resolve(newPost)
			}, (err)=>{
				reject(err)
			})
		}, (err) => {
			reject(err)
		})
	})
}

exports.put = function (user) {
	return new Promise(function (resolve, reject) {
		var u = new User(user)
		u.save().then((newUser) => {
			resolve(newUser)
		}, (err) => {
			reject(err)
		})
	})
}

exports.putPost = function (post) {
	return new Promise(function (resolve, reject) {
		User.findOneAndUpdate({
			username: post.postAuthor
		}, {
			$push: {
				post: post
			}
		}).then((msg) => {
			resolve(post)
		}, (err) => {
			reject(err)
		})
	})
}

exports.putComment = function (comment, post) {
	return new Promise(function (resolve, reject) {
		User.findOneAndUpdate({
			username: comment.commentAuthor
		}, {
			$push: {comment: comment}
		}).then((msg) => {
			User.findOne({
				username: post.postAuthor
			}).then((user) => {
				for(let i = 0 ; i < user.post.length ; i++){
					if(user.post[i]._id.equals(post._id)){
						user.post[i].commentNumber = post.commentNumber
					}
				}
				user.save().then((newUser)=>{
					resolve(comment)
				})
			})
		}, (err) => {
			reject(err)
		})
	})
}

exports.putNestedComment = function (comment, post, commentID) {
	return new Promise(function (resolve, reject) {
		User.findOneAndUpdate({
			username: comment.commentAuthor
		}, {
			$push: {comment: comment}
		}).then((msg) => {
			// User.findOne({
			// 	username: post.postAuthor
			// }).then((user) => {
			// 	for(let i = 0 ; i < user.post.length ; i++){
			// 		if(user.post[i]._id.equals(post._id)){
			// 			for(let j = 0 ; j < user.post[i].comment.length ; j++){
			// 				if(user.post[i].comment[j]._id.equals(commentID)){
			// 					user.post[i].comment[j].nestedComments.push(comment._id)
			// 				}
			// 			}
			// 		}
			// 	}
			// 	user.save().then((msg)=>{})
			// })
			resolve(comment)
		}, (err) => {
			reject(err)
		})
	})
}

exports.authenticate = function (username) {
	return new Promise(function (resolve, reject) {
		User.findOne({
			username
		}).then((user) => {
			resolve(user)
		}, (err) => {
			reject(err)
		})
	})
}

exports.edit = function (username, id, postTitle, postDescription) {
	console.log(username);
	return new Promise(function (resolve, reject) {
		User.findOne({
			username: username
		}).then((foundUser) => {
			if(foundUser){
				for(let i = 0; i < foundUser.post.length; i++ ){
					if(foundUser.post[i]._id == id){
						foundUser.post[i].postTitle = postTitle
						foundUser.post[i].postDescription = postDescription
					}
				}
			
				foundUser.save().then((newUser)=>{
					resolve(newUser)
				}, (err)=>{
					reject(err)
				})
			}else{console.log("foundUser is empty")}
		})
	})
}

exports.validate = function (username, emailAddress) {
	return new Promise(function (resolve, reject) {
		User.findOne({
			username
		}).then((user) => {
			if (user) {
				resolve(1)
			}
		}, (err) => {
			reject(err)
		})
		User.findOne({
			emailAddress
		}).then((user) => {
			if (user) {
				resolve(2)
			}
		}, (err) => {
			reject(err)
		})
		resolve(3)
	})
}