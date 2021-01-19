const axios = require("axios").default;
const { baseURL, apiVersion } = require("../config");
const moment = require("moment");

/**
 * 
 * @class User
 */
module.exports = class User {
	constructor() {}

	/**
	 * 
	 * @param {String} username Username yang ingin dicari.
	 */
	async get(username) {
		if (!username) throw Error("[NODE-KOTAKODE]: Username diperlukan!");
		
		const response = await axios.get(`${baseURL}/v${apiVersion}/users?page=0&page_size=30&name_contains=${encodeURIComponent(username)}&sort_by=-experience`, {
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Node-Kotakode/Agent"
			}
		});

		const result = response.data;
		if (!result['data'].length) return undefined;

		const user = result['data'].find(x => x.attributes.displayName.toLowerCase() === username.toLowerCase());

		if (user) {
			const userStrc = {
				"id": Number(user.attributes.id),
				"username": user.attributes.displayName,
				"experience": user.attributes.experience,
				"createdAt": moment(user.attributes.createdAt).utcOffset("+0700").format("LLL"),
				"lastAccess": moment(user.attributes.lastAccessedAt).utcOffset("+0700").format("LLL"),
				"location": user.attributes.location,
				"views": Number(user.attributes.views),
				"imageURL": user.attributes.profileImageUrl,
				"social": {
					"telegram": user.attributes.telegramUsername,
					"instagram": user.attributes.instagramUsername
				},
				"firstName": user.attributes.firstName,
				"lastName": user.attributes.lastName,
				"title": user.attributes.title,
				"company": user.attributes.company
			}
			return userStrc;
		} else {
			return null;
		}
	}

	async tops() {
		const response = await axios.get(`${baseURL}/v${apiVersion}/metaUser/top-users`, {
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Node-Kotakode/Agent"
			}
		});

		const result = response.data;
		const results = [];

		for (let i = 0; i < result['data'].length; i++) {
			const user = result['data'][i].attributes;
			const userDetail = result['included'][i].attributes;
			const item = {};

			item['id'] = Number(user['id']);
			item['records'] = {
				"points": user['totalPoints'],
				"upvotesWeekly": user['totalUpvotesWeekly'],
				"answersWeekly": user['totalAnswersWeekly'],
				"acceptedAnswersWeekly": user['totalAcceptedAnswersWeekly']
			};

			item['detail'] = {
				"username": userDetail['displayName'],
				"image_url": userDetail['profileImageUrl'],
				"experience": userDetail['experience']
			};

			results.push(item);
		}

		return results;
	}

	async stars() {
		const response = await axios.get(`${baseURL}/v${apiVersion}/metaUser/rising-stars`, {
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Node-Kotakode/Agent"
			}
		});

		const result = response.data;
		const results = [];

		for (let i = 0; i < result['data'].length; i++) {
			const user = result['data'][i].attributes;
			const userDetail = result['included'][i].attributes;

			const item = {};
			item['id'] = Number(user['id']);
			item['records'] = {
				"points": user['totalPoints'],
				"upvotesWeekly": user['totalUpvotesWeekly'],
				"answersWeekly": user['totalAnswersWeekly'],
				"acceptedAnswersWeekly": user['totalAcceptedAnswersWeekly']
			};

			item['detail'] = {
				"username": userDetail['displayName'],
				"image_url": userDetail['profileImageUrl'],
				"experience": userDetail['experience']
			};

			results.push(item);
		}

		return results;
	}
}