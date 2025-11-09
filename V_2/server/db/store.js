// Deprecated: JSON file store replaced by MongoDB via Mongoose
module.exports = {
  read() { throw new Error('store.read is deprecated; use Mongoose models'); },
  write() { throw new Error('store.write is deprecated; use Mongoose models'); },
};


