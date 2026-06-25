'use strict';

/** Language disambiguation module for same-script languages. */

const { NgramHiMrDisambiguator } = require('./hiMr');
const { NgramBnAsDisambiguator } = require('./bnAs');

module.exports = {
  NgramHiMrDisambiguator,
  NgramBnAsDisambiguator,
};
