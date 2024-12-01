const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

// Image Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + '_' + file.originalname);
    }
});
const upload = multer({ storage: storage }).single('image');

// Insert a User into Database Router
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });
        await user.save();
        req.session.message = {
            type: 'alert alert-success',
            message: 'User Added Successfully'
        };
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.status(500).send('An error occurred while saving the user');
    }
});

// Get All Users Route
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render('index', {
            title: 'Homepage',
            users: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching users');
    }
});

// Add User Route
router.get('/add', (req, res) => {
    res.render('add_users', {
        title: 'Add Users'
    });
});

// Edit User Route
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            res.redirect('/');
        } else {
            res.render('edit_users', {
                title: 'Edit User',
                user: user
            });
        }
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// Update User Route
router.post('/update/:id', upload, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            res.redirect('/');
        } else {
            user.name = req.body.name;
            user.email = req.body.email;
            user.phone = req.body.phone;
            if (req.file) {
                user.image = req.file.filename;
            }
            await user.save();
            req.session.message = {
                type: 'alert alert-success',
                message: 'User Updated Successfully'
            };
            res.redirect('/');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// Delete User Route
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await User.findByIdAndDelete(id);
        req.session.message = {
            type: 'alert alert-success',
            message: 'User Deleted Successfully'
        };
        res.redirect('/');
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

module.exports = router;