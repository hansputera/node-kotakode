const axios = require("axios").default;
const { baseURL, apiVersion } = require("../config");
const moment = require("moment");

/**
 * 
 * @param {Number} page
 * @param {Number} pageSize
 * @param {String} question
 * @returns {String}
 */
function buildQuery(page, pageSize, question) {
	let questionQuery = "in_body_title=";
	if (!page) page = 0;
	if (!pageSize) pageSize = 10;
	if (question) questionQuery += encodeURIComponent(question);

	const query = `?page=${page}&page_size=${pageSize}&${questionQuery}&sort_by=-creation`;

	return query;
}

/**
 * 
 * @class Question
 */
module.exports = class Question {
	/**
	 * 
	 * @param {String} question Pertanyaan yang ingin dicari.
	 */
	constructor(question) {
		this.question = null;

		if (question) {
			this.question = question;
		}
	}

	async get() {
		const before = Date.now();
		const response = await axios.get(`${baseURL}/v${apiVersion}/questions${buildQuery(0, 10, this.question ? this.question : "")}`, {
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Node-Kotakode/Agent"
			}
		});

		if (response.statusText !== "OK") {
			return undefined;
		} else {
			const results = [];
			const questions = response.data['data'];
			const users = response.data['included'];

			for (let i = 0; i < questions.length; i++) {
				const question = questions[i].attributes;
				let user = users[i].attributes;
				const item = {};

				item['question'] = {
					"id": Number(question['id']),
					"title": question['title'],
					"answered": question['answerCount'] > 0 ? true : false,
					"content": question['body'],
					"createdAt": moment(question['createdAt']).utcOffset("+0700").format("LLL"),
					"tags": question['tags'],
					"likesCount": question['netLikes'],
					"editedAt": question['lastEditedAt'] ? moment(question['lastEditedAt']).utcOffset("+0700").format("LLL") : null,
					"activityDate": moment(question['lastActivityDate']).utcOffset("+0700").format("LLL"),
					"author": user
				};

				if (item['question']['answered']) item['question']['answerCount'] = question['answerCount'];

				if (item['question']['answered']) {
					item['answers'] = await this._answer(item['question']['id']);
				}
				results.push(item);
			}

			const end = Date.now();
			console.log(`[NODE-KOTAKODE]: ${Math.floor(end - before)}ms.`);
			return results;
		}
	}

	/**
	 * 
	 * @param {Number} questionId
	 * @description Mendapatkan jawaban dari questionID.
	 */
	async _answer(questionId) {
		if (isNaN(questionId)) throw Error("[NODE-KOTAKODE]: Invalid Question ID");
		
		const response = await axios.get(`${baseURL}/v${apiVersion}/questions/${questionId}/answers?page=0&page_size=50`, {
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Node-Kotakode/Agent"
			}
		});

		const result = response.data;
		if (result['error'] || !result['data'].length) return undefined;
		else {
			const results = [];

			const answers = result['data'];
			const users = result['included'];

			for (let i = 0; i < answers.length; i++) {
				const item = {};

				const answer = answers[i].attributes;
				const user = users[i].attributes;

				item['id'] = Number(answer['id']);
				item['content'] = answer['body'];
				item['createdAt'] = moment(answer['createdAt']).utcOffset("+0700").format("LLL");
				item['lastActivityDate'] = moment(answer['lastActivityDate']).utcOffset("+0700").format("LLL");
				
				if (answer['lastEditedAt']) item['editedAt'] = moment(answer['lastEditedAt']).utcOffset("+0700").format("LLL");

				item['accepted'] = answer['isAccepted'];
				item['likes'] = answer['netLikes'];
				item['user'] = user;
				results.push(item);
			}

			return results;
		}
	}
}