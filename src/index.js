const express = require('express')
require('./db/mongoose')
const userRouters = require('./routers/user')
const taskRouters = require('./routers/task')

const app = express()
const port = process.env.PORT


app.use(express.json());
app.use(userRouters)
app.use(taskRouters)

app.listen(port, () => {
    console.log(`Task-Manger app has started at PORT: ${port}`)
})