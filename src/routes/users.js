const express = require('express')
const User = require('../models/User') //만들어둔 스키마 불러오기
const expressAsyncHandler = require('express-async-handler')
const { generateToken, isAuth } = require('../../auth')

const router = express.Router() //하위 url 로직을 처리하는 라우터 모듈

//회원가입 
// router.post('/register',(req, res, next) => { // URL: .../api/users/register
//   res.json("회원가입") 
// }) - 작동 확인용
router.post('/register', expressAsyncHandler(async (req, res, next) => {
  console.log(req.body) //디버깅
  const user = new User({ //메모리에 데이터스키마 생성
    name: req.body.name,
    email: req.body.email,
    userId: req.body.userId,
    password: req.body.password,
  }) 
  const newUser = await user.save() //DB에 User 생성
  if(!newUser){ //DB 생성이 안된 경우
    res.status(401).json({code: 401, message: 'Invalid User Data'})
  }else{
    const { name, email, userId, isAdmin, createdAt } = newUser //저장하고싶은값만 뽑아옴 (password는 뽑아오면 안되서 뺌)
    res.json({
      code: 200,
      token: generateToken(newUser), //새로운 사용자 정보로 토큰 생성
      name, email, userId, isAdmin, createdAt //화면에 표시
    })
  }
}))

//로그인
// router.post('/login', (req, res, next) => { // URL: .../api/users/login
//   res.json("로그인")
// }) 
router.post('/login', expressAsyncHandler (async (req, res, next) => {
  console.log(req.body)
  const loginUser = await User.findOne({ //User에서 찾기
    email: req.body.email,
    password: req.body.password,
  })
  if(!loginUser){ //User에 없는경우
    res.status(401).json({code: 401, message: 'Invalid Email or Password'})
  }else{
    const { name, email, userId, isAdmin, createdAt } = loginUser
    res.json({
      code: 200,
      token: generateToken(loginUser),
      name, email, userId, isAdmin, createdAt
    })
  }
}))


router.post('/logout', (req, res, next) => { // URL: .../api/users/logout
  res.json("로그아웃")
})

//사용자 정보 변경
// router.put('/:id', (req, res, next) => { // URL: .../api/users/{id}
//   res.json("사용자 정보 변경")
// })
//isAuth: 사용자를 수정할 권한이 있는지 검사하는 미들웨어, isAuth에서 에러가나면 expressAsyncHandler는 작동하지않음
router.put('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id) //DB에서 id값 찾음(기존값)
  if(!user){
    res.status(404).json({ code: 404, message: 'User Not Found'})
  }else{
    console.log(req.body)
    user.name = req.body.name || user.name // req.body.name의 값이 있으면 req.body.name, 없으면 기존값인 user.name
    user.email = req.body.email || user.email
    user.password = req.body.password || user.password
    //위까지는 메모리에서 업데이트
    const updatedUser = await user.save() //DB에 사용자정보 업데이트(실제 업데이트)(새로운값)
    const { name, email, userId, isAdmin, createdAt } = updatedUser
    res.json({
      code: 200,
      token: generateToken(updatedUser), //사용자정보가 업데이트 되었으니 토큰도 업데이트
      name, email, userId, isAdmin, createdAt
    })
  }
}))

//사용자 정보 삭제
// router.delete('/:id', (req, res, next) => { // URL: .../api/users/{id}
//   res.json("사용자 정보 삭제")
// })
router.delete('/:id', isAuth, expressAsyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id) //DB에서 찾은 id 바로 삭제
  if(!user){
    res.status(404).json({code: 404, message: 'User Not Found'})
  }else{
    res.status(204).json({code: 204, message: 'User deleted successfully!'}) //204: no content
  }
}))

module.exports = router