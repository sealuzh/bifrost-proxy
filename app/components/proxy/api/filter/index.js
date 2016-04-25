"use strict";

import express from 'express'
import controller from './filter.controller.js'

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.delete('/', controller.delete);

export default router;