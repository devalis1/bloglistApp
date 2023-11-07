const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')
const jwt = require('jsonwebtoken')


//////////////////// Api calls
blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    const body = request.body
    const user = request.user

    const blog = new Blog(body)
    
    try {
        if (blog.likes == undefined) {
            blog.likes = 0
        }
        // user id saved to blog data
        blog.user = user.id
        
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.status(201).json(savedBlog)
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    const user = request.user;

    try {
        const blog = await Blog.findById(request.params.id);
        logger.info('Blog to be deleted:', blog);

        if (blog) {
            console.log('Blog found with ID:', request.params.id);
        } else {
            console.log('Blog not found with ID:', request.params.id);
            return response.status(404).json({ error: 'Blog not found' });
        }
        
        if (blog && blog.user && user && user.id && blog.user.toString() === user.id.toString()) {
            console.log('User is authorized to delete the blog.');
            
            // The actual deletion operation
            await Blog.findByIdAndRemove(request.params.id);
            return response.status(204).end();
        
        } else {
            console.log('User is not authorized to delete the blog.');
            return response.status(403).json({ error: 'Not authorized to delete this blog' });
        }
        
        
    }
    catch(error) {
        logger.error('Error during blog deletion:', error);
        return response.status(500).send({ error: error.message });
    }     
});



blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body
  
    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }
  
    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

module.exports = blogsRouter