const Utils = {
  getUserMetadata() {
    return {
      'description': 'bootstrapuser',
      'uid': 'bootstrapuser',
      'is_remote': false
    };
  },
  emptyCookieWithExpiry() {
    return;
  }
};

module.exports = Utils;
