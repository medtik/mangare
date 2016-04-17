// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  'default e2e tests': function (browser) {
    browser
    .url('http://localhost:8080')
      .waitForElementVisible('#mangare', 5000)
      .assert.containsText('h1', 'Mangare')
      .end()
  }
}
