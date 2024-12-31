'use strict';

import { Mapper } from './modules/mapper.js';
const canvas = document.getElementById('canvas');

const mapper = new Mapper(canvas);

mapper.drawMap();
