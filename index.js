// const Person = require('./models/person')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const app = express()

app.use(express.json())
// cors allows requests from all origins, so we can now use frontend from another localhost port
app.use(cors())
// do we have a dist to show
app.use(express.static('dist'))

// MONGOOSE START 

const password = process.argv[2]

const url =
    `mongodb+srv://tietokantatrh:${password}@cluster0.wdqdihi.mongodb.net/puhelinluettelo?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

// editing schema so we dont get fields _v and renaming _id to id
personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)
// mongoose part ends

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

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": "2"
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
    }
]


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }

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

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => (person.id !== id))
    console.log(persons)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

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

    // if not, person is added to the phonebook with random id and
    // to the persons array. the id must be converted to string because
    // json server does not support non-string ids 
    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 2000).toString()
    }

    persons = persons.concat(person)
    response.json(person)
    console.log(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})