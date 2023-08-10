const mongoose = require('mongoose')

const { Schema } = mongoose
const { Types: { ObjectId } } = Schema // = mongoose.Schema.Types.ObjectId

const todoSchema = new Schema({ //스키마 정의, 객체형태로 정의
  author: {
    type: ObjectId, //사용자의 ID
    required: true, //필수입력
    ref: 'User' //사용자의 id값 저장
  },
  category:{
    type: String,
    required: true,
    trim: true
  },
  imgUrl:{
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim : true //공백 제거
  },
  description: { //required를 주지 않아서 입력을 해도되고 안해도 되는 필드
    type: String,
    trim : true
  },
  isDone: {
    type: Boolean,
    default: false // isDone필드를 전달할때 자동으로 false값 입력됨
  },
  createdAt: {
    type: Date,
    default: Date.now //현재시각 자동저장
  },
  lastModifiedAt: { //마지막으로 수정된 시각
    type: Date,
    default: Date.now
  },
  finishedAt: { //할일 종료 날짜
    type: Date,
    default: Date.now
  }
})

//정의한 스키마 메모리 생성
const Todo = mongoose.model('Todo',todoSchema) //Todo -> todos 라고 컬렉션이름으로 저장해줌(몽고db에서)

//외부에서 해당 파일을 사용할수 있게 export (허용)
module.exports = Todo

// // todo 데이터 생성 테스트
// const todo = new Todo({ //메모리에만 생성
//   author: '111111111111111111111111', //24자리 Mongodb 고유 id값
//   title: '주말에 공원 산책가기',
//   description: '주말에 집 주변에 있는 공원에 가서 1시간동안 산책하기'
//   //나머지 isDone, createdAt, lastModifiedAt, finishedAt은 deafault값이 있어서 입력안해도 됨
// })
// //데이터 베이스 접속 -> 비동기:promise로 접근
// todo.save() // mongodb에서 insert, insertMany와 동일한 동작
//   .then(() => console.log('todo created !'))
//   .catch(e => console.log(`Failed to create todo: ${e}`))