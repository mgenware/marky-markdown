var pickBy = require('lodash.pickby')
var MD = require('markdown-it-coldmark')('coldmark')
var lazyHeaders = require('markdown-it-lazy-headers')
var emoji = require('markdown-it-emoji')
var expandTabs = require('markdown-it-expand-tabs')
var githubTaskList = require('markdown-it-task-lists')

var cleanup = require('./cleanup')
var githubLinkify = require('./linkify')

var headingLinks = require('./plugin/heading-links')
var gravatar = require('./plugin/gravatar')
var github = require('./plugin/github')
var youtube = require('./plugin/youtube')
var cdnImages = require('./plugin/cdn')
var packagize = require('./plugin/packagize')
var htmlHeading = require('./plugin/html-heading')
var relaxedLinkRefs = require('./gfm/relaxed-link-reference')
var githubHeadings = require('./gfm/indented-headings')
var overrideLinkDestinationParser = require('./gfm/override-link-destination-parser')
var looseLinkParsing = require('./gfm/link')
var looseImageParsing = require('./gfm/image')
var relNoFollow = require('./plugin/nofollow')

var render = module.exports = function (markdown, options) {
  return render.getParser(options).render(markdown)
}

render.getParser = function (options) {
  var parser = MD
    .use(lazyHeaders)
    .use(emoji, {shortcuts: {}})
    .use(expandTabs, {tabWidth: 4})
    .use(githubTaskList)
    .use(headingLinks, options)
    .use(githubHeadings)
    .use(relaxedLinkRefs)
    .use(gravatar)
    .use(github, {package: options.package})
    .use(youtube)
    .use(packagize, {package: options.package})
    .use(htmlHeading)
    .use(overrideLinkDestinationParser)
    .use(looseLinkParsing)
    .use(looseImageParsing)

  if (options.nofollow) {
    parser.use(relNoFollow)
  }

  if (options.serveImagesWithCDN) parser.use(cdnImages, {package: options.package})

  return githubLinkify(parser)
}

render.renderPackageDescription = function (description) {
  return MD({html: true}).renderInline(description)
}
