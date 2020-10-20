const maxDepth = 4;
const colors = ['r', 'b', 'g', 'y', 'o', 'v', 'k', 'w', '*'];
let deck = [];

function onLoad() {
	countShuffled();
}

function enterDeck() {
	deck = [];
	refreshDeck();

	let html = '';
	for (const color of generateCards()) {
		const filename = (color == '*' ? 'wild' : color) + '.png';
		html += `<img class="card" src="images/${filename}" onClick="addCard(\'${color}\', this)"/>`;
	}
	document.getElementById('remaining-cards').innerHTML = html;
	document.getElementById('remaining-cards-container').classList.remove('hidden');
	document.querySelectorAll('#controls button').forEach(button => button.disabled = true);
}

function addCard(color, el) {
	el.remove();
	deck.push(color);
	refreshDeck();
	if (deck.length == 110) {
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
	let sum = 0;
	const n = 40;
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
			for (let depth = Math.min(history.length, maxDepth - 1); depth > 0 && !deepestNode; depth--) {
				// console.log('depth ', depth);
				let currNode = root;
				for (let i = 0; i < depth && currNode; i++) {
					deepestNode = currNode;
					currNode = currNode.children.find(e => e.color == history[history.length - 1 - i]);
				}
			}
			// console.log('history', history);
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
		} else {
			currGuess = remaining[Math.floor(Math.random() * remaining.length)];
		}

		if (card == currGuess) {
			numCorrect++;
		}
		history.push(card);
		remaining.splice(remaining.indexOf(card), 1);

		let currNode = root;
		for (let i = Math.min(maxDepth, history.length); i > 0; i--) {
			const nextNode = currNode.children.find(e => e.color == history[history.length - i]);
			if (nextNode) {
				currNode = nextNode;
			} else {
				const newNode = {
					color: history[history.length - i],
					children: [],
					count: 0,
				};
				currNode.children.push(newNode);
				currNode = newNode;
			}
			currNode.count++;
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
	const cards = [];
	for (const color of colors) {
		const n = color == '*' ? 14 : 12;
		for (let i = 0; i < n; i++) {
			cards.push(color);
		}
	}
	return cards;
}

function refreshDeck() {
	let html = '';
	for (const color of deck) {
		const filename = (color == '*' ? 'wild' : color) + '.png';
		html += `<img class="card" src="images/${filename}" />`;
	}
	document.getElementById('deck').innerHTML = html;
}
