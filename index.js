const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('morgan')
const mongoose = require('mongoose')
const axios = require('axios') //fetch와 비슷하지만 문법이 살짝 다름
// const todo = require('./src/models/Todo')
// const user = require('./src/models/User')

const corsOptions = { //CORS 옵션
  origin: 'http://127.0.0.1:5500', //해당 URL 주소만 요청을 허락함 
  credentials: true //사용자 인증이 필요한 리소스를 요청할수 있도록 허용함
}
const CONNECT_URL = 'mongodb://127.0.0.1:27017/hyung'

mongoose.connect(CONNECT_URL) //몽고db서버와 연동
 .then(() => console.log('mongodb connected ...'))
 .catch(e => console.log(`failed to connect mongodb: ${e}`))

app.use(cors(corsOptions)) //CORS 설정
app.use(express.json()) //request body 파싱
app.use(logger('tiny')) //Logger 설정

app.get('/hello', (req, res) => {
  res.json('hello world!') //send대신 json을 쓰면 json형태(문자열)로 response됨 - 브라우저에서 조회 가능
})
app.post('/hello', (req, res) => {
  console.log(req.body)
  res.json({userId: req.body.userId, email: req.body.email})
})

app.get('/error', (req, res) => {
  throw new Error('서버에 치명적인 에러가 발생했습니다.')
})

app.get('/fetch', async(req, res) => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
  res.send(response.data)
})

// HTTP 코드 (200-응답성공, 401-권한문제, 404-못찾음)
// 폴백 핸들러 (fallback handler) :뒤쪽에서 에러처리
app.use((req, res, next) => { //오류 처리하는 미들웨어 - 사용자가 요청한 페이지가 없는 경우
  res.status(404).send('Page Not Found')
})

app.use((err, req, res, next) =>{ //서버 내부 오류 처리,에러가 나면 전부 건너뛰고 이 코드로 와서 처리함
  console.error(err.stack) //무슨 에러가 났는지 콘솔에 보여줌
  res.status(500).send('Internal Server Error')
})


app.listen(5000, () => {
  console.log('server is running on port 5000 ...')

})