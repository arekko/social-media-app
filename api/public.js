
const express = require('express');
const router = express.Router();


router.get('/event', (req, res) => {
    res.send({
        status: "ok",
        message: "hello world"
    })
});




module.exports = router;