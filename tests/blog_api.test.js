const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')

let token;

const userCredentials = {
  username: 'testing123',
  password: 'testing123'
};

// initial testing
beforeEach(async () => {
  
  const response = await api
  .post('/api/login')
  .send(userCredentials);


  token = response.body.token;

  await Blog.deleteMany({})

  let blogObject = new Blog(helper.initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(helper.initialBlogs[1])
  await blogObject.save()
}, 10000)

beforeAll(async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('testing123', 10); // Replace with your actual hashing logic
  const user = new User({ username: 'testing123', passwordHash });

  await user.save();
});


// Tests
describe('initial tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`) 
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('All blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
  
  test('an specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`) 

    const titles = response.body.map(r => r.title)
  
    expect(titles).toContain('Testing1')
  })
  
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: "async/await simplifies making async calls",
      author: "Alan",
      url: "www.alan.com",
      likes: 5
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) 
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    
    const titles = blogsAtEnd.map(n => n.title)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
  })
  
  test('blog without title is not added', async () => {
    const newBlog = {
      author: "Alan3",
      url: "www.alan3.com",
      likes: 15
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  
    const blogsAtEnd = await helper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
  
  test('blog post likes is 0 if not passed', async () => {
    const newBlog = {
      title: "TestingNoLikes",
      author: "Alan3",
      url: "www.alan3.com"
    }
  
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)  
  
    expect(response.body.likes).toEqual(0)
  })
  
  test('id is correctly named', async () => {
    const blogs = await helper.blogsInDb()
    const ids = blogs.map(e => e.id)
    expect(ids).toBeDefined();
  })

  test('adding a blog fails with status code 401 Unauthorized if a token is not provided', async () => {
    const newBlog = {
      title: "async/await simplifies making async calls",
      author: "Alan",
      url: "www.alan.com",
      likes: 5
    };
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401);
  
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test('deletion of a blog succeeds with status code 204 if id and token are valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    
    if (!blogsAtStart.length) {
      throw new Error('No blogs in the database at the start of the test.');
    }

    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
      .catch(err => {
        if (err.response) {
          console.error('HTTP Response Error:', err.response.body);
        } else {
          console.error('Error:', err);
        }
      });


    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const titles = blogsAtEnd.map(r => r.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
  
  test('deletion of a blog fails with status code 401 if token is not provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    
    if (!blogsAtStart.length) {
      throw new Error('No blogs in the database at the start of the test.');
    }

    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
  });
  
})



afterAll(async () => {
  await mongoose.connection.close()
})