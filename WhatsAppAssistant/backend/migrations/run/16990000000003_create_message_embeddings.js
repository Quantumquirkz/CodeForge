/* eslint-disable camelcase */
'use strict';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE message_embeddings (
      id SERIAL PRIMARY KEY,
      message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
      embedding vector(384) NOT NULL,
      model VARCHAR(80) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX ON message_embeddings USING hnsw (embedding vector_cosine_ops);
    CREATE INDEX ON message_embeddings (message_id);
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('message_embeddings');
};
