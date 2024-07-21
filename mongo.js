const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://tietokantatrh:${password}@cluster0.wdqdihi.mongodb.net/puhelinluettelo?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

console.log(process.argv.length)

if (process.argv.length == 3) {
    // with 3 arguments we are only going to list everything
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}

// there are 5 arguments if person is going to be added to the phonebook db
else if (process.argv.length == 5) {
    const argName = process.argv[3]
    const argNumber = process.argv[4]

    const person = new Person({
        name: argName,
        number: argNumber,
    })

    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
    console.log(`added ${argName} number ${argNumber} to phonebook`)
}

else {
    console.log('wrong number of arguments')
    mongoose.connection.close()
}