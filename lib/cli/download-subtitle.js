var url = require('url');
var api = require('addic7ed-api');
var runApplescript = require('run-applescript');
var spinner = require('../spinner');

/**
 * @param  {Object} show
 *
 * @return {String}
 */
function formatName ( show ) {
	var distribution = '';
	var group = '';
	if ( show.distribution.toLowerCase() !== 'unknown' ) {
		distribution = ' ' + show.distribution;
	}
	if ( show.group.toLowerCase() !== 'unknown' ) {
		group = ' ' + show.group;
	}
	return show.title + ' ' + show.season + 'x' + show.episode + group + distribution;
}

/**
 * @param  {String}   fileName
 *
 * @return {Promise}
 */
function placeFileLocation ( fileName ) {

	if ( !fileName ) {
		throw new Error('Subtitle filename not provided.');
	}

	return runApplescript([
		'tell application (path to frontmost application as text)',
		'set fileName to choose file name with prompt "Save subtitle as:" default name "' + fileName + '" default location (path to desktop folder)',
		'POSIX path of fileName',
		'end'
	].join('\n'));

}

module.exports = {

	/**
	 * @param  {Object} show
	 *
	 * @return {Promise}
	 */
	fetchSubtitleItems: function ( show ) {

		spinner.start();

		return api.search(show.title, show.season, show.episode, 'eng')
			.then(function ( list ) {
				spinner.stop();
				return list.map(function ( item ) {
					return {
						raw: item,
						title: formatName({
							title: show.title,
							season: show.season,
							episode: show.episode,
							group: item.group,
							distribution: item.distribution
						}),
						url: url.format({
							protocol: 'http',
							host: 'www.addic7ed.com',
							pathname: item.link
						})
					};
				});
			})
			.catch(function ( err ) {
				spinner.stop();
				throw err;
			});

	},

	/**
	 * @param  {Object} subInfo
	 *
	 * @return {Promise}
	 */
	downloadSubtitle: function ( subInfo ) {

		if ( !('raw' in subInfo) ) {
			return Promise.reject('Expected subtitle info to contain raw data.');
		}

		placeFileLocation(subInfo.title + '.srt')
			.then(function ( fileName ) {
				spinner.start();
				return api.download(subInfo.raw, fileName);
			})
			.then(function () {
				spinner.stop();
			})
			.catch(function ( err ) {
				spinner.stop();
				throw err;
			});

	}

};