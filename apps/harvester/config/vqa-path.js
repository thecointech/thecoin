// commonjs module
const { join } = require("path");
module.exports = {
  getVqaSecretPath: function() {
    return join(__dirname, 'vqa-secrets.json')
  }
}
