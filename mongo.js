const mongoose = require('mongoose')
const config = require('./utils/config')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = config.MONGODB_URI;

mongoose.set('strictQuery',false)
mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

mongoose.connect(mongoUrl)
if (process.argv.length === 3) {
  Blog.find({}).then(result => {
    console.log("blogs:")
    result.forEach(blog => {
      console.log(`${blog.title}`)
    })
    mongoose.connection.close()
  })
}
else {
  const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: likes
  })
  
  blog.save().then(result => {
    console.log(`${result.title} added to blog list`)
    mongoose.connection.close()
  })
}