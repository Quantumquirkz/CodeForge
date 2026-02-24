/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension('vector', { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropExtension('vector', { ifExists: true });
};
