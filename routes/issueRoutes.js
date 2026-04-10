const router = require('express').Router();
const issue = require('../controllers/issueController');
const check = require('../middleware/authMiddleware');

router.get('/', check, issue.issuePage);
router.post('/add', check, issue.issueBook);
router.get('/return/:id', check, issue.returnBook);

module.exports = router;