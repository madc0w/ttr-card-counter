let deckType = 'ttr';
const deckTypes = {
	standard: {
		imagesDir: 'playing-cards',
		numCards: 52,
		colors: [
			'c01',
			'c02',
			'c03',
			'c04',
			'c05',
			'c06',
			'c07',
			'c08',
			'c09',
			'c10',
			'cj',
			'ck',
			'cq',
			'd01',
			'd02',
			'd03',
			'd04',
			'd05',
			'd06',
			'd07',
			'd08',
			'd09',
			'd10',
			'dj',
			'dk',
			'dq',
			'h01',
			'h02',
			'h03',
			'h04',
			'h05',
			'h06',
			'h07',
			'h08',
			'h09',
			'h10',
			'hj',
			'hk',
			'hq',
			's01',
			's02',
			's03',
			's04',
			's05',
			's06',
			's07',
			's08',
			's09',
			's10',
			'sj',
			'sk',
			'sq',
		],
	},
	ttr: {
		imagesDir: 'ttr-cards',
		numCards: 110,
		colors: ['r', 'b', 'g', 'y', 'o', 'v', 'k', 'w', '*'],
	},
};
const maxDepth = 4;
let deck = [];
// let deck = ["r", "g", "r", "g", "r", "g", "r", "g", "r", "g", "r", "g", "r", "y", "r", "y", "r", "y", "y", "r", "y", "r", "y", "r", "o", "*", "k", "*", "k", "*", "k", "*", "k", "*", "k", "*", "k", "*", "k", "o", "w", "o", "w", "o", "w", "o", "w", "o", "w", "o", "*", "v", "*", "v", "*", "v", "*", "v", "*", "o", "*", "o", "o", "b", "o", "b", "v", "b", "v", "b", "v", "b", "v", "b", "k", "b", "k", "b", "w", "b", "w", "b", "w", "b", "w", "b", "g", "y", "g", "y", "g", "y", "g", "y", "g", "y", "g", "y", "o", "v", "k", "v", "k", "v", "k", "v", "w", "*", "w", "w"];
// let deck = ["k", "y", "*", "b", "v", "o", "y", "g", "b", "y", "r", "w", "v", "*", "k", "*", "o", "y", "v", "r", "r", "k", "y", "k", "g", "b", "v", "b", "g", "o", "o", "y", "w", "g", "r", "y", "y", "g", "o", "*", "o", "w", "o", "v", "w", "*", "o", "y", "g", "g", "w", "o", "*", "g", "w", "k", "g", "*", "y", "g", "k", "k", "o", "v", "b", "r", "b", "w", "v", "o", "w", "r", "w", "r", "v", "v", "g", "k", "*", "y", "w", "k", "r", "b", "v", "*", "*", "g", "b", "r", "r", "b", "r", "k", "w", "*", "k", "v", "v", "w", "b", "*", "r", "y", "*", "*", "b", "k", "o", "b"];

let nodeId = 0;

function onLoad() {
	// refreshDeck();
	// count(true);
	// count(false);
	countShuffled();
}

function enterDeck() {
	document.getElementById('results').classList.add('hidden');
	deck = [];
	refreshDeck();

	let html = '';
	for (const color of generateCards()) {
		const filename = (color == '*' ? 'wild' : color) + '.png';
		html += `<img class="card" src="images/${deckTypes[deckType].imagesDir}/${filename}" onClick="addCard(\'${color}\', this)"/>`;
	}
	document.getElementById('remaining-cards').innerHTML = html;
	document.getElementById('remaining-cards-container').classList.remove('hidden');
	document.querySelectorAll('#controls button').forEach(button => button.disabled = true);
}

function addCard(color, el) {
	el.remove();
	deck.push(color);
	refreshDeck();
	if (deck.length == deckTypes[deckType].numCards) {
		document.getElementById('remaining-cards-container').classList.add('hidden');
		document.querySelectorAll('#controls button').forEach(button => button.disabled = false);
		count(false);
		count(true);
	}
}

function countShuffled() {
	document.getElementById('remaining-cards-container').classList.add('hidden');
	deck = shuffle();
	refreshDeck();
	count(false);
	count(true);
}

function countUnshuffled() {
	document.getElementById('remaining-cards-container').classList.add('hidden');
	deck = generateCards();
	refreshDeck();
	count(false);
	count(true);
}

function count(isBlind) {
	document.getElementById('results').classList.remove('hidden');
	let sum = 0;
	const n = 1;
	for (let i = 0; i < n; i++) {
		sum += guess(isBlind);
	}
	const id = isBlind ? 'blind-guess-result' : 'educated-guess-result';
	document.getElementById(id).innerHTML = (100 * sum / (n * deck.length)).toFixed(1);
}

function guess(isBlind) {
	const remaining = generateCards();
	const root = {
		color: null,
		count: 0,
		children: []
	};
	const history = [];
	let numCorrect = 0;

	for (const card of deck) {
		let deepestNode = null;
		if (!isBlind) {
			// if (history.length > 4) {
			// 	console.log();
			// }
			for (let depth = Math.min(history.length, maxDepth - 1); depth > 0 && !deepestNode; depth--) {
				// console.log('depth ', depth);
				deepestNode = root;
				for (let i = depth; i > 0 && deepestNode; i--) {
					deepestNode = deepestNode.children.find(e => e.color == history[history.length - i]);
				}
			}
			// console.log('history', history);
			// console.log('root', JSON.parse(JSON.stringify(root)));
			// console.log('deepestNode', deepestNode);
		}

		let currGuess = null;
		if (deepestNode) {
			const possible = [];
			let countSum = 0;
			for (const child of deepestNode.children) {
				const foundColor = remaining.find(remainingColor => child.color == remainingColor);
				if (foundColor) {
					const node = deepestNode.children.find(child => child.color == foundColor);
					possible.push(node);
					countSum += node.count;
				}
			}
			// console.log('possible', possible);

			const r = Math.random() * countSum;
			let sum = 0;
			for (const p of possible) {
				sum += p.count;
				if (sum >= r) {
					currGuess = p.color;
					break;
				}
			}
		}

		if (currGuess) {
			if (!remaining.includes(currGuess)) {
				console.error('bad guess!');
			}
			console.log(card, currGuess);
		} else {
			currGuess = remaining[Math.floor(Math.random() * remaining.length)];
		}

		// console.log('currGuess', currGuess);
		if (card == currGuess) {
			numCorrect++;
		}
		history.push(card);
		remaining.splice(remaining.indexOf(card), 1);

		// add to tree
		{
			let currNode = root;
			let depth = 0;
			for (let i = Math.min(maxDepth, history.length); i > 0; i--) {
				const nextNode = currNode.children.find(e => e.color == history[history.length - i]);
				if (nextNode) {
					currNode = nextNode;
				} else {
					const newNode = {
						color: history[history.length - i],
						children: [],
						count: 0,
						depth,
						parent: currNode.color,
						id: nodeId++,
					};
					currNode.children.push(newNode);
					currNode = newNode;
				}
				currNode.count++;
				depth++;
			}
		}
		// console.log('card', card);
		// console.log('root', root);
	}
	// console.log('numCorrect', numCorrect);
	return numCorrect;
}

function shuffle() {
	const deck = [];
	const cards = generateCards();
	do {
		const cardIndex = Math.floor(Math.random() * cards.length);
		deck.push(cards[cardIndex]);
		cards.splice(cardIndex, 1);
	} while (cards.length > 0);
	return deck;
}

function generateCards() {
	if (deckType == 'ttr') {
		const cards = [];
		for (const color of deckTypes.ttr.colors) {
			const n = color == '*' ? 14 : 12;
			for (let i = 0; i < n; i++) {
				cards.push(color);
			}
		}
		return cards;
	} else if (deckType == 'standard') {
		return JSON.parse(JSON.stringify(deckTypes.standard.colors));
	}
}

function refreshDeck() {
	let html = '';
	for (const color of deck) {
		const filename = (color == '*' ? 'wild' : color) + '.png';
		html += `<img class="card" src="images/${deckTypes[deckType].imagesDir}/${filename}" />`;
	}
	document.getElementById('deck').innerHTML = html;
}

function selectType(type) {
	deckType = type;
	countShuffled();
}
