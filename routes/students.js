var express = require('express')
var app = express()
var ObjectId = require('mongodb').ObjectId

// SHOW LIST OF USERS
app.get('/', function(req, res, next) {	
	// fetch and sort students
	req.db.collection('students').find().sort({"name": 1}).toArray(function(err, result) {
	
		if (err) {
			req.flash('error', err)
			res.render('student/list', {
				title: 'Student List', 
				data: ''
			})
		} else {
			// render to views/student/list.ejs template file
			res.render('student/list', {
				title: 'Student List', 
				data: result
			})
		}
	})
})

// SHOW ADD STUDENT FORM
app.get('/add', function(req, res, next){	
	
	res.render('student/add', {
		title: 'Add New Student',
		name: '',
		dob:'',
		email: '',
		mobile:'',
		qual:''		
	})
})

// ADD NEW STUDENT POST ACTION

app.post('/add', function(req, res, next){	
	req.assert('name', 'Name is required').notEmpty() 
	req.assert('dob', 'Dob is required').isDate()                                                                  //Validate name             //Validate age
	req.assert('email', 'A valid email is required').isEmail() 
    req.assert('mobile', 'A valid mobile is required').notEmpty()  
    req.assert('qual', 'A valid qual is required').notEmpty()  
	

    var errors = req.validationErrors()
    
    if( !errors ) {   
		var student = {
			name: req.sanitize('name').escape().trim(),
			dob: req.sanitize('dob').escape().trim(),
			email: req.sanitize('email').escape().trim(),
			mobile: req.sanitize('mobile').escape().trim(),
			qual: req.sanitize('qual').escape().trim(),

		}
				 
		req.db.collection('students').insert(student, function(err, result) {
			if (err) {
				req.flash('error', err)
				
				// render to views/student/add.ejs
				res.render('student/add', {
					title: 'Add New Student',
					name: student.name,
					dob: student.dob,
					email: student.email,	
					mobile: student.mobile,					
					qual: student.qual					

				})
			} else {				
				req.flash('success', 'Data added successfully!')
								
				res.redirect('/students')
			}
		})		
	}
	else {   
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})				
		req.flash('error', error_msg)		
		
        res.render('student/add', { 
            title: 'Add New Student',
			name: req.body.name,
            dob: req.body.dob,
			email: req.body.email,
            mobile: req.body.mobile,
            qual: req.body.qual
			
        })
    }
})

// SHOW EDIT STUDENT FORM
app.get('/edit/(:id)', function(req, res, next){
	var o_id = new ObjectId(req.params.id)
	req.db.collection('students').find({"_id": o_id}).toArray(function(err, result) {
		if(err) return console.log(err)
		
		if (!result) {
			req.flash('error', 'Student not found with id = ' + req.params.id)
			res.redirect('/students')
		}
		else { 
			// render to views/student/edit.ejs  file
			res.render('student/edit', {
				title: 'Edit Student', 
			
				id: result[0]._id,
				name: result[0].name,
				dob: result[0].dob,
				email: result[0].email,
				mobile: result[0].mobile,					
				qual: result[0].qual					

			})
		}
	})	
})

// EDIT STUDENT POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
	req.assert('name', 'Name is required').notEmpty() 
	req.assert('dob', 'Dob is required').isDate()                                                                //Validate name            //Validate age
	req.assert('email', 'A valid email is required').isEmail() 
    req.assert('mobile', 'A valid mobile is required').notEmpty()  
    req.assert('qual', 'A valid qual is required').notEmpty()  
	 
    var errors = req.validationErrors()
    
    if( !errors ) {   		
		
		var student = {
			name: req.sanitize('name').escape().trim(),
			dob: req.sanitize('dob').escape().trim(),
			email: req.sanitize('email').escape().trim(),
			mobile: req.sanitize('mobile').escape().trim(),
			qual: req.sanitize('qual').escape().trim()
		}
		
		var o_id = new ObjectId(req.params.id)
		req.db.collection('students').update({"_id": o_id}, student, function(err, result) {
			if (err) {
				req.flash('error', err)
				
				// render to views/student/edit.ejs
				res.render('student/edit', {
					title: 'Edit Student',
					id: req.params.id,
					name: req.body.name,
            dob: req.body.dob,
			email: req.body.email,
            mobile: req.body.mobile,
            qual: req.body.qual
				})
			} else {
				req.flash('success', 'Data updated successfully!')
				
				res.redirect('/students')
				
			}
		})		
	}
	else {   
		var error_msg = ''
		errors.forEach(function(error) {
			error_msg += error.msg + '<br>'
		})
		req.flash('error', error_msg)
		
        res.render('student/edit', { 
            title: 'Edit Student',            
			id: req.params.id, 
			name: req.body.name,
            dob: req.body.dob,
			email: req.body.email,
            mobile: req.body.mobile,
            qual: req.body.qual
        })
    }
})

// DELETE STUDENT
app.delete('/delete/(:id)', function(req, res, next) {	
	var o_id = new ObjectId(req.params.id)
	req.db.collection('students').remove({"_id": o_id}, function(err, result) {
		if (err) {
			req.flash('error', err)
			// redirect to students list page
			res.redirect('/students')
		} else {
			req.flash('success', 'Student deleted successfully! id = ' + req.params.id)
			res.redirect('/students')
		}
	})	
})

module.exports = app
