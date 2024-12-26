const pluginRss = require('@11ty/eleventy-plugin-rss')
const markdownIt = require('markdown-it')
const i18n = require('eleventy-plugin-i18n');

const translations = require('./src/data/translations.js');

const filters = require('./utils/filters.js')
const transforms = require('./utils/transforms.js')
const shortcodes = require('./utils/shortcodes.js')
const iconsprite = require('./utils/iconsprite.js')

const byStartDate = (a, b) => {
    if (a.data.start && b.data.start) {
        return a.data.start - b.data.start
    }
    return 0
}

module.exports = function (config) {
    // Plugins
    config.addPlugin(pluginRss)

    // Internationalization cfg
    config.addPlugin(i18n, {
        translations,
        fallbackLocales: {
          '*': 'en'
        }
      });

    // Filters
    Object.keys(filters).forEach((filterName) => {
        config.addFilter(filterName, filters[filterName])
    })

    // Transforms
    Object.keys(transforms).forEach((transformName) => {
        config.addTransform(transformName, transforms[transformName])
    })

    // Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        config.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })

    // Icon Sprite
    config.addNunjucksAsyncShortcode('iconsprite', iconsprite)

    // Asset Watch Targets
    config.addWatchTarget('./src/assets')

    // Markdown
    config.setLibrary(
        'md',
        markdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
    )

    // Layouts
    config.addLayoutAlias('base', 'base.njk')
    config.addLayoutAlias('resume', 'resume.njk')

    // Collections
    const collections = ['work', 'education', 'projects', 'certifications']

    // Internationalization (i18n) with just English and French - Define Collections for each language
    collections.forEach((name) => {
        config.addCollection(`en_${name}`, (collection) => {    
            return collection
                .getFilteredByGlob(`src/en/entries/${name}/*.md`)
                .sort(byStartDate)
        })
    })

    collections.forEach((name) => {
        config.addCollection(`fr_${name}`, (collection) => {    
            return collection
                .getFilteredByGlob(`src/fr/entries/${name}/*.md`)
                .sort(byStartDate)
        })
    })

    // Pass-through files
    config.addPassthroughCopy('src/robots.txt')
    config.addPassthroughCopy('src/assets/images')
    config.addPassthroughCopy('src/assets/fonts')

    // Deep-Merge
    config.setDataDeepMerge(true)

    // Base Config
    return {
        dir: {
            input: 'src',
            output: 'dist',
            includes: 'includes',
            layouts: 'layouts',
            data: 'data'
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk'
    }
}
