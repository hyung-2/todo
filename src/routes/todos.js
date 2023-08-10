const express = require('express')
const Todo = require('../models/Todo')
const expressAsyncHandler = require('express-async-handler')
const { isAuth } = require('../../auth')

const mongoose = require('mongoose')
const { Types: {ObjectId} } = mongoose

const router = express.Router()

//사용자의 todo 전체목록 조회
// router.get('/', (req, res, next) => { // URL: .../api/todos/
//   res.json("전체 할일목록 조회")
// })
router.get('/', isAuth, expressAsyncHandler(async (req, res, next) => {
  const todos = await Todo.find({ author: req.user._id }).populate('author') //해당 사용자의 할일목록 조회, populate: author에 있는 id값을 실제 사용자정보로 바꿔줌
  if(todos.length === 0){
    res.status(404).json({code: 404, message: 'Failed to find todos!'})
  }else{
    res.json({code: 200, todos}) //변수이름과 객체의 프로퍼티이름이 같으면 생략해서 쓸수있음
  }
}))


//사용자의 특정 todo 조회
// router.get('/:id', (req, res, next) => { // URL: .../api/todos/{id}
//   res.json("특정 할일 조회")
// })
router.get('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
  const todo = await Todo.findOne({
    author: req.user._id,
    _id: req.params.id
  })
  if(!todo){
    res.status(404).json({code: 404, message: 'Todo Not Found'})
  }else{
    res.json({code: 200,  todo})
  }
}))


//사용자의 todo 생성하기
// router.post('/', (req, res, next) => { // URL: .../api/todos/
//   res.json("새로운 할일 생성")
// })
router.post('/', isAuth, expressAsyncHandler(async (req, res, next) => {
  //중복체크 (현재 사용자가 생성하려는 TODO의 타이틀이 이미 DB에 있는지 검사)
  const searchedTodo = await Todo.findOne({
    author: req.user._id, 
    title: req.body.title,
  })
  if(searchedTodo){ //todo가 있는경우
    res.status(204).json({code: 204, message: "이미 생성된 Todo 입니다."})
  }else{
    const todo = new Todo({ //메모리에 저장
      author: req.user._id, //실제 사용자의 id값
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      imgUrl: req.body.imgUrl
    })
    const newTodo = await todo.save() //DB에 저장
    if(!newTodo){
      res.status(401).json({code: 401, message: 'Failed to save todo.'})
    }else{
      res.status(201).json({ //201:새로 생성된 content
        code: 201,
        message: 'New todo created',
        newTodo
      })
    }
  }
}))


//사용자의 특정 todo 변경
// router.put('/:id', (req, res, next) => { // URL: .../api/todos/{id}
//   res.json("특정 할일 변경")
// })
router.put('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
  const todo = await Todo.findOne({
    author: req.user._id,
    _id: req.params.id
  })
  if(!todo){
    res.status(404).json({code: 404, message: 'Todo Not Found'})
  }else{ //메모리에저장
    todo.title = req.body.title || todo.title
    todo.description = req.body.description || todo.description
    todo.isDone = req.body.isDone || todo.isDone
    todo.category = req.body.category || todo.category
    todo.imgUrl = req.body.imgUrl || todo.imgUrl
    todo.lastModifiedAt = new Date() // 수정된 시각 업데이트
    todo.finishedAt = todo.isDone ? todo.lastModifiedAt : todo.finishedAt
    
    const updatedTodo = await todo.save() //실제 DB에 업데이트
    res.json({
      code: 200,
      message: 'Todo Updated',
      updatedTodo
    })
  }
}))


//사용자의 특정 todo 삭제
// router.delete('/:id', (req, res, next) => { // URL: .../api/todos/{id}
//   res.json("특정 할일 삭제")
// })
router.delete('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
  const todo = await Todo.findOne({
    author: req.user._id,
    _id: req.params.id
  })
  if(!todo){
    res.status(404).json({code: 404, message: 'Todo Not Found'})
  }else{
    await Todo.deleteOne({
      author: req.user._id,
      _id: req.params.id
    })
    res.status(204).json({code: 204, message: 'Todo deleted Successfully!'})
  }
}))


//그룹핑 - category, isDone 기준
router.get('/group/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
  if(!req.user.isAdmin){
    res.status(401).json({code: 401, message: 'You are not authorized to use this service !'})
  }else{
    const docs = await Todo.aggregate([ //mongodb aggregate처럼
      {
        $group: {
          _id: `$${req.params.field}`,
          count: {$sum: 1}
        }
      }
    ])
    console.log(`Number of group: ${docs.length}`) //그룹 갯수 출력
    docs.sort((d1, d2) => d1._id - d2._id) //id값 기준으로 오름차순
    res.json({code: 200, docs})
  }
}))


//사용자 본인의 todo 그룹핑
router.get('/group/mine/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
  const docs = await Todo.aggregate([
    {$match: { author: new ObjectId(req.user._id) }}, // 나의 할일목록 필터링},
    {$group: {
        _id: `$${req.params.field}`,
        count: {$sum: 1}
      }
    }
  ])
  console.log(`Number of group: ${docs.length}`) //그룹 갯수 출력
  docs.sort((d1, d2) => d1._id - d2._id) //id값 기준으로 오름차순
  res.json({code: 200, docs})
}))


//그룹핑 - 날짜 기준
router.get('/group/date/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
  if(!req.user.isAdmin){
    res.status(401).json({code: 401, message: '관리자가 아닙니다.'})
  }else{
    if(req.params.field === 'createdAt' 
    || req.params.field === 'lastModifiedAt'
    || req.params.field === 'finishedAt'){
      const docs = await Todo.aggregate([
        {
          $group: {
            _id: { year: {$year: `$${req.params.field}`}, month: {$month: `$${req.params.field}`}},
            count: {$sum: 1}
          }
        },
        {$sort: {_id:1}} //날짜 오름차순 정렬
      ])
      console.log(`Number of group: ${docs.length}`) //그룹 갯수 출력
      docs.sort((d1, d2) => d1._id - d2._id) //id값 기준으로 오름차순
      res.json({code: 200, docs})
    }else{
      res.status(204).json({code: 204, message: 'No content'})
    } 
  }
}))


//사용자 본인의 날짜기준 그룹핑
router.get('/group/mine/date/:field', isAuth, expressAsyncHandler(async (req, res, next) => {
  if(req.params.field === 'createdAt' 
    || req.params.field === 'lastModifiedAt'
    || req.params.field === 'finishedAt'){
      const docs = await Todo.aggregate([
        {$match: { author: new ObjectId(req.user._id)}},
        {$group: {
          _id: { year: {$year: `$${req.params.field}`}, month: {$month: `$${req.params.field}`}},
          count: {$sum: 1}
        }},
        {$sort: {_id:1}} //날짜 오름차순 정렬
      ])
      console.log(`Number of group: ${docs.length}`) //그룹 갯수 출력
      docs.sort((d1, d2) => d1._id - d2._id) //id값 기준으로 오름차순
      res.json({code: 200, docs})
    }else{
      res.status(204).json({code: 204, message: 'No content'})
    }
}))


module.exports = router