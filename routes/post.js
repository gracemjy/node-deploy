const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

try {
  fs.readdirSync('uploads'); // 디렉토리 파일 읽기
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');// 디렉토리 생성
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});
/* 좋아요 기능 */
router.post('/:id/like', async(req, res, next)=>{
  try{  
    const post=await Post.findOne({ where: { id: req.params.id}});
    await post.addLiker(req.user.id);
    res.send('OK');
  } catch(error){
    console.error(error);
    next(error);
  }
});
/* 좋아요 취소 기능 */
// router.post('/:id/unlike', 
// 이하 동일
router.delete('/:id/like', async(req, res, next)=>{
  try{  
    const post=await Post.findOne({ where: { id: req.params.id}});
    await post.removeLiker(req.user.id);
    res.send('OK');
  } catch(error){
    console.error(error);
    next(error);
  }
});

/* views/main.html 의script 코드에 이어서 */
router.delete('/:id', isLoggedIn, async(req, res, next)=>{
  try{
    await Post.destroy({
      where: {id: req.params.id, userId: req.user.id},
    });// 로그인된 사용자의 게시물 삭제
    res.send('OK');
  }catch(err){
    console.error(err);
    next(error);
  }
});

module.exports = router;