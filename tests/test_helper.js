const Blog = require('../models/blog')
const User = require('../models/user')


const initialBlogs = [
    {
        "title": "Testing1",
        "author": "Alan",
        "url": "www.alan.com",
        "likes": 45,
    },
    {
        "title": "Testing2",
        "author": "Alan3",
        "url": "www.alan3.com",
        "likes": 15,
    }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}


module.exports = {
    initialBlogs, nonExistingId, blogsInDb, usersInDb
}