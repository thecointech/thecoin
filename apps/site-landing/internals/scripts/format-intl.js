/**
 * This script will format the internationalization messages from yarn extract.
 */
exports.compile = function (msgs) {
  const results = {}
  for (const [id, msg] of Object.entries(msgs)) {
    results[id] = msg.defaultMessage
  }
  //console.log(results)
  return results
}