const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async (email, password, done) => {
        try {
            const exUser = await User.findOne({ where: { email } });
            if (exUser) {// 같은 이메일이 있는지 확인 후 비밀번호 비교
                const result = await bcrypt.compare(password, exUser.password);
                if (result) done(null, exUser); // 로그인 성공
                else done(null, false, { message: '비밀번호가 일ㅊ하지 않습니다.' });// 로그인 실패
            } else done(null, false, { message: '가입되지 않은 회원입니다.' });
        } catch (error) {// 서버 에러
            console.error(error);
            done(error);
        }
    }));
};