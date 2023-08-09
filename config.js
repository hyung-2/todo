const dotenv = require('dotenv')

// process.env 객체에 .env 파일에 있는 환경변수 주입
dotenv.config() 


//외부에서 사용하기 위해 export
//process.env.MONGODB_URL => config.MONGODB_URL로 쓰려고 바꿈. process.env.MONGODB_URL이렇게 써도된다
module.exports = {
  MONGODB_URL: process.env.MONGODB_URL, //.env 파일의 MONGODB_URL 을 읽어옴
  JWT_SECRET: process.env.JWT_SECRET
}