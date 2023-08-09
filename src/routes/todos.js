const express = require('express')
const Todo = require('../models/Todo')
const expressAsyncHandler = require('express-async-handler')
const { isAuth } = require('../../auth')

const router = express.Router()

//todo 전체목록 조회
// router.get('/', (req, res, next) => { // URL: .../api/todos/
//   res.json("전체 할일목록 조회")
// })
router.get('/', isAuth, expressAsyncHandler(async (req, res, next) => {
  const todos = await Todo.find({ author: req.user._id }) //해당 사용자의 할일목록 조회
  if(todos.length === 0){
    res.status(404).json({code: 404, message: 'Failed to find todos!'})
  }else{
    res.json({code: 200, todos}) //변수이름과 객체의 프로퍼티이름이 같으면 생략해서 쓸수있음
  }
}))


router.get('/:id', (req, res, next) => { // URL: .../api/todos/{id}
  res.json("특정 할일 조회")
})


//todo 생성하기
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


router.put('/:id', (req, res, next) => { // URL: .../api/todos/{id}
  res.json("특정 할일 변경")
})

router.delete('/:id', (req, res, next) => { // URL: .../api/todos/{id}
  res.json("특정 할일 삭제")
})

module.exports = router