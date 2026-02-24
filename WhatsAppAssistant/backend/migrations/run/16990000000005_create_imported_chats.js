/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('imported_chats', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    source_file: { type: 'varchar(255)' },
    imported_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('imported_messages', {
    id: { type: 'serial', primaryKey: true },
    imported_chat_id: { type: 'integer', references: 'imported_chats(id)', onDelete: 'CASCADE', notNull: true },
    sender_label: { type: 'varchar(255)', notNull: true },
    content: { type: 'text', notNull: true },
    timestamp: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('imported_messages', 'imported_chat_id');
};

exports.down = (pgm) => {
  pgm.dropTable('imported_messages');
  pgm.dropTable('imported_chats');
};
