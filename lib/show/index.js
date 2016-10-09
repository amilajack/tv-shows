var _ = require('lodash');
var got = require('got');
var Klass = require('kist-klass');

module.exports = Klass.extend({

	constructor: function ( opts ) {

		if ( typeof opts === 'undefined' ) {
			throw new Error('Expected a show configuration.');
		}

		this.title = opts.title;
		this.webChannel = opts.webChannel || false;
		this.tvmazeId = opts.tvmazeId;
		this.addic7edId = opts.addic7edId;
		this.searchQuery = opts.searchQuery || [this.title.toLowerCase()];

	},

	/**
	 * @param {String} title
	 */
	setTitle: function ( title ) {
		this.title = title;
	},

	/**
	 * @return {Promise}
	 */
	getEpisodes: function () {

		return got(`http://api.tvmaze.com/shows/${this.tvmazeId}?embed=episodes`, { json: true })
			.then(( res ) => {

				var data = res.body;
				var rest = _.omit(data, '_embedded');
				var episodes = _.get(data, '_embedded.episodes');

				return _.map(episodes, ( episode ) => {
					return _.extend({}, episode, {
						show: rest
					});
				});

			});

	}

});