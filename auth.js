const config = require('./config')
const jwt = require('jsonwebtoken')

//토큰 생성
const generateToken = (user) => {
  return jwt.sign({
    //첫번째 인자
    _id: user._id, //사용자 정보 (json 문자열)
    name: user.email,
    userId: user.userId,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  },
  config.JWT_SECRET, // jwt 비밀 키 - 두번째인자
  {//3번째 인자
    expiresIn: '1d', //만료기한 (1day)
    issuer: 'hyung' //발행자
  } )
}

//사용자 권한 검증
const isAuth = (req, res, next) => { //권한을 확인하는 라우트핸들러
  const bearToken = req.headers.authorization //요청헤더의 Authorization 속성 조회 Bearer로 시작함
  if(!bearToken){ //헤더에 토큰이 없는경우
    res.status(401).json({message: 'Token is not supplied'}) //401:권한 에러
  }else{
    const token = bearToken.slice(7, bearToken.length) //실제 jwt 토큰 (Bearer 제거)
    //복호화(verify)()
    jwt.verify(token, config.JWT_SECRET, (err, userInfo) => {
      if(err && err.name === 'TokenExpiredError'){ //토큰이 만료된 경우
        res.status(419).json({code: 419, message: 'Token expired!'}) //419:unknown
      }else if(err){ //토큰 복호화중 에러발생
        res.status(401).json({code: 401, message: 'Invalid Token!'})
      }else{  
        req.user = userInfo // 브라우저에서 전송한 사용자 정보(복호화한 jwt 토큰)를 req객체에 저장 - 미들웨어임
        next() //미들웨어기때문에 다음 핸들러로 요청 넘김
      }
    }) 
  }
}

//관리자 권한 검증
const isAdmin = (req, res, next) => {
  if(req.user && req.user.isAdmin ){ //isAuth에서 받아온 req.user, isAdmin이 true이면
    next() //다음 서비스 사용할수 있도록 허용
  }else{
    res.status(401).json({code: 401, message: 'You are not valid admin user!'})
  }
}

module.exports = { //객체형태로 외부 전송
  generateToken,
  isAuth,
  isAdmin,
}