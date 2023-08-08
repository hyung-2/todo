const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({ // 스키마 정의
  name: {
    type: String,
    required: true,
  },
  email: {
    type:String,
    required: true,
    unique: true, // unique: 색인(primary key), 고유한 id값, email값은 중복불가
  },
  userId: {
    type:String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now,
  }
})

const User = mongoose.model('User', userSchema) // User -> users 라고 컬렉션이름 저장
module.exports = User

// // User 데이터 생성 테스트
// const user = new User({
//   name: '태양',
//   email: 'sun@gmail.com',
//   userId: 'sunrise',
//   password: '1234567890',
//   isAdmin: true, //관리자 권한 부여
// })

// user.save()
//   .then(() => console.log('user created!'))