const express = require('express')
const router = express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

router.get('/user/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users', async (req, res) => {
    const newUser = new User(req.body)

    try {
        await newUser.save()
        sendWelcomeEmail(newUser.email, newUser.name)
        const token = await newUser.generateAuthToken()

        res.status(201).send({ newUser, token})
    }catch (e) {
        res.status(500).send(e)
    }
})


router.post('/user/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token})
    }catch(e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/user/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    }catch (e) {
        res.send(500).send()
    }
})

router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch(e) {
        res.send(500).send()
    }
})

router.patch('/user/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = [ 'name', 'email', 'password', 'age']

    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid) {
        return res.status(400).send({ error: "INVALID!!! Updates"})
    }

    const _id = req.user._id
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        // const updatedUser = await User.findByIdAndUpdate(_id, updation, {new: true, runValidators: true});

        res.send(req.user)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.delete('/user/me', auth, async (req, res) => {
    const _id = req.params.id

    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload a image of type jpeg, jpg or png"))
        }
        return cb(undefined, true)
    }
})

router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

router.delete('/user/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-type', 'image/png')
        res.send(user.avatar)
    }catch (e) {
        res.status(404).send()
    }
})

module.exports = router