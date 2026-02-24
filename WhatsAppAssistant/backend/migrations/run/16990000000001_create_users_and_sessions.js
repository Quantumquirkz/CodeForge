/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('whatsapp_sessions', {
    id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', references: 'users(id)', onDelete: 'CASCADE' },
    session_data: { type: 'text' },
    phone_id: { type: 'varchar(50)' },
    status: { type: 'varchar(20)', notNull: true, default: 'disconnected' },
    last_qr: { type: 'text' },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('whatsapp_sessions', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('whatsapp_sessions');
  pgm.dropTable('users');
};
