function memo(createId, duration, name) {
  return { action: 'memo', createId, duration, name };
}
function forget(name, createId) {
  return { action: 'forget', name, createId };
}

module.exports = {
  memo,
  forget,
};
