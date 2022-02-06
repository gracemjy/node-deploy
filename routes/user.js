const express = require('express');
const {isLoggedIn} = require('./middlewares');
const User = require('../models/user');

const router = express.Router();
/* views/main.html 의script 코드에 이어서 */
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {id: req.user.id } }); // 로그인된 사용자
        if (user) {
            await user.addFollowing(parseInt(req.params.id, 10)); // 현재 사용자를 팔로잉에 추가
            res.send('success');
        } else 
            res.status(404).send('no user');
    } catch (error) {
        console.error(error);
        next(error);
    }
});
/* views/main.html 의script 코드에 이어서 */
router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {
    try {
        console.log(`user: ${ req.user.id }, params: ${req.params.id }`);
        const user = await User.findOne({
            where: { id: req.user.id } }); // 로그인된 사용자
        if (user) {
            await user.removeFollowing(parseInt(req.params.id, 10)); // 현재 사용자를 팔로워에서 삭제
            res.send('success');
        } else 
            res.status(404).send('no user');
    } catch (error) {
        console.error(error);
        next(error);
    }
});
/* views/main.html 의script 코드에 이어서 */
router.post('/profile', isLoggedIn, async (req, res, next) => {
    try {
        // console.log(`AAAAA ${ req.user.id }, ${req.params.id }`);
        await User.update({
            nick: req.body.nick}, 
            {where: { id: req.user.id}},
        ); // 로그인된 사용자의 닉네임을 변경
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;
