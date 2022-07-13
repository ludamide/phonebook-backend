require('dotenv').config()
require('./mongo')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/Person')

morgan.token('post-data', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

app.use(cors())
app.use(express.json())
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens['post-data'](req, res)
  ].join(' ')
}))
app.use(express.static('build'))

let persons = [
  // { 
  //   "id": 1,
  //   "name": "Arto Hellas", 
  //   "number": "040-123456"
  // },
  // { 
  //   "id": 2,
  //   "name": "Ada Lovelace", 
  //   "number": "39-44-5323523"
  // },
  // { 
  //   "id": 3,
  //   "name": "Dan Abramov", 
  //   "number": "12-43-234345"
  // },
  // { 
  //   "id": 4,
  //   "name": "Mary Poppendieck", 
  //   "number": "39-23-6423122"
  // }
]

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  const time = new Date().toString()
  response.send(`<p>Phonebook has info for ${persons.length} people</p>\n<p>${time}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const { id } = request.params
  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).json({
        error: "Not found"
      })
    }
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const { id } = request.params
  Person.findByIdAndDelete(id).then(() => {
    response.status(204).end()
  })
})

app.post('/api/persons', (request, response) => {
  const person = request.body
  if (!person || !person.name || !person.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    })
  }
  if (persons.some(el => el.name === person.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  const newPerson = new Person({
    name: person.name,
    number: person.number
  })
  newPerson.save().then(savedPerson => {
    response.status(201).json(savedPerson)
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
