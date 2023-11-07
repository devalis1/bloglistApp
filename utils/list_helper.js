const _ = require('lodash');

const dummy = (blogs) => {
  return 1;
}

const totalLikes = (blogs) => {
  sumOfLikes = blogs.map(i=>i.likes).reduce((a,b)=>a+b)
  return sumOfLikes
}

const favoriteBlog = (blogs) => {
  var maxLikes = Math.max(...blogs.map(e => e.likes));
  var mostLikedBlog = blogs.find(blog => blog.likes === maxLikes);

  return {
    "title": mostLikedBlog.title,
    "author": mostLikedBlog.author,
    "likes": mostLikedBlog.likes
  }
}

const mostBlogs = (blogs) => {
  var authors = blogs.map(e => e.author)

  var mostBlogsWritten = _.chain(authors).countBy().entries().maxBy(_.last).thru(_.head).value()
  var totalBlogsWritten = _.chain(authors).countBy().entries().maxBy(_.last).thru(_.last).value()

  return {
    "author": mostBlogsWritten,
    "blogs": totalBlogsWritten
  }
}

const mostLikes = (blogs) => {
  var authors = blogs.map(e => e.author)

  var mostBlogsWritten = _.chain(authors).countBy().entries().maxBy(_.last).thru(_.head).value()

  var blogsByAuthor = blogs.filter(e => e.author == mostBlogsWritten)

  var totalLikedFromAuthor = blogsByAuthor.map(i=>i.likes).reduce((a,b)=>a+b)

  return {
    "author": mostBlogsWritten,
    "likes": totalLikedFromAuthor
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}