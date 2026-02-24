/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('style_config', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', references: 'users(id)', onDelete: 'CASCADE' },
    tone: { type: 'varchar(30)', default: 'friendly' },
    formality: { type: 'integer', default: 5 },
    brevity: { type: 'integer', default: 5 },
    emoji_policy: { type: 'varchar(20)', default: 'moderate' },
    signature_phrases: { type: 'jsonb', default: '[]' },
    writing_rules: { type: 'jsonb', default: '[]' },
    owner_name: { type: 'varchar(100)' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('style_config', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('style_config');
};
