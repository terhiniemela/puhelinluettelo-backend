require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
//const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

const Person = require('./models/person')

// do we have a dist to show
app.use(express.static('dist'))
app.use(express.json())
// cors allows requests from all origins, so we can now use frontend from another localhost port
//app.use(cors())

// MORGAN LOGS
// creating a token for body to be shown in morgan log
morgan.token('body', (request, response) => {
    // morgan token function is expected to return a string value, so
    // the body must be transformed from json to string, if there is body content
    if (request.body) {
        return JSON.stringify(request.body)
    }
    // otherwise returning empty
    return
})

// log configuration for 3.8.
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// 
let persons = []


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.get('/info', (request, response) => {
    // info page consists of the size of the phonebook and time of page request
    const message = '<div>Phonebook has info for ' + persons.length + ' people</div>'
    // we want to have the time from the server of the request 
    const requestTime = new Date().toString()
    console.log(requestTime)
    response.send(message + requestTime)
}
)

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            console.log("delete")
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }

    /*
    // if name or number is missing, responsing with 400 and error message
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    // checking if name is already listed in the phonebook, true if found
    const nameCheck = persons.find(person => person.name === body.name)
    if (nameCheck) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
*/
    // if not, person is added to the phonebook with random id and
    // to the persons array. the id must be converted to string because
    // json server does not support non-string ids 
    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })

    persons = persons.concat(person)
    console.log(persons)
})

/*
app.use(unknownEndpoint) = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
    */

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

// tämä tulee kaikkien muiden middlewarejen ja routejen rekisteröinnin jälkeen!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})