const mongoose = require('mongoose')
const validator = require('validator')

const databaseName = "task-manager"

mongoose.connect(process.env.CONNECTION_URL+'/'+databaseName, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex: true,
    useFindAndModify: false
})

