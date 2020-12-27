module.exports.getAuthFromHeaders = function (headers) {
  let token;
  const parts = headers.authorization.split(' ');
  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
  }
  return token;
};
