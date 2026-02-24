/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('chats', {
    id: { type: 'serial', primaryKey: true },
    session_id: { type: 'integer', references: 'whatsapp_sessions(id)', onDelete: 'CASCADE', notNull: true },
    wa_chat_id: { type: 'varchar(100)', notNull: true },
    name: { type: 'varchar(255)' },
    is_group: { type: 'boolean', notNull: true, default: false },
    rules: {
      type: 'jsonb',
      default: { respond: 'respond_always', keyword: null },
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('chats', 'session_id');
  pgm.createIndex('chats', ['session_id', 'wa_chat_id'], { unique: true });

  pgm.createTable('messages', {
    id: { type: 'serial', primaryKey: true },
    chat_id: { type: 'integer', references: 'chats(id)', onDelete: 'CASCADE', notNull: true },
    wa_message_id: { type: 'varchar(100)' },
    sender_id: { type: 'varchar(50)', notNull: true },
    content: { type: 'text', notNull: true },
    role: { type: 'varchar(20)', notNull: true },
    timestamp: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('messages', 'chat_id');
  pgm.createIndex('messages', ['chat_id', 'timestamp']);
};

exports.down = (pgm) => {
  pgm.dropTable('messages');
  pgm.dropTable('chats');
};
