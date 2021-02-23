const express = require('express')
const router = express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')
const { VirtualType } = require('mongoose')


//Get /tasks?completed=true
//Get /tasks?limit=2&skip=3
//Get /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}
    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({owner: req.user._id})
        // res.send(tasks)
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
            // Ascending = 1 :::: Descending = -1
        }).execPopulate()
        res.send(req.user.tasks)
    }catch (e) {
        res.status(500).send()
    }
})

router.get('/task/:id', auth, async (req,res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    }catch (e) {
        res.status(500).send()
    }
})


router.post('/tasks', auth, async (req,res) => {
    const newTask = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await newTask.save()
        res.status(201).send(newTask)
    }catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/task/:id', auth, async (req, res) => {
    const _id = req.params.id
    const updation = req.body

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValid = updates.every((update) => allowedUpdates.includes(update))

    if(!isValid) {
        return res.status(400).send({error: "INVALID!!! Updates"})
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        // const updatedTask = await Task.findByIdAndUpdate(_id, updation, {new: true, runValidators: true})
        res.send(task)
    }catch(e) {
        res.status(500).send()
    }
})

router.delete('/task/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const deletedTask = await Task.findOneAndDelete({_id, owner: req.user._id})
        if(!deletedTask) {
            res.status(404).send({error: "NOT FOUND"})
        }
        res.send(deletedTask)
    }catch (e) {
        res.status(500).send()
    }
})

module.exports = router