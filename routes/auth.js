const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const  User  = require('../models/user');

const router = express.Router();
// 회원가입 라우터: 같은 이메일로 가입한 사용자가 없다면 비밀번호를 암호화하고 사용자 정보를 생성
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) // 같은 이메일이 존재하면 회원가입 페이지로 되돌림ㄹ
            return res.redirect('/join?error=exist');
        const hash = await bcrypt.hash(password, 12); // 존재하지 않으면 비밀번호를 암호화
        await User.create({
            email,
            nick,
            password: hash,
        });
        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});
// 로그인 라우터: authError 값이 없고 user 값이 있다면 로그인 성공
router.post('/login', isNotLoggedIn, async (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});
// 로그아웃 라우터: req.user 객체를 제거하고 메인페이지로 되돌림
router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    req.session.destroy();
    res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
}), (req, res) => {
    res.redirect('/');
});

module.exports = router;