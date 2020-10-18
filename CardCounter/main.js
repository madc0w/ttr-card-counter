const maxDepth = 4;
const colors = ['r', 'b', 'g', 'y', 'o', 'v', 'k', 'w', '*'];
let deck = [];

function onLoad() {
	shuffle();
	guess();
}

function guess() {
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
		for (let depth = maxDepth - 1; depth > 0 && !deepestNode; depth--) {
			console.log('depth ', depth);
			let currNode = root;
			for (let i = 0; i < depth && i < history.length; i++) {
				const nextNode = currNode.children.find(e => e.color == history[history.length - 1 - i]);
				if (nextNode) {
					currNode = nextNode;
				} else {
					deepestNode = currNode;
					break;
				}
			}
		}
		console.log('deepestNode', deepestNode);

		let currGuess = null;
		if (deepestNode) {
			const possible = [];
			let countSum = 0;
			for (const r of remaining) {
				const found = deepestNode.children.find(child => r == child.color);
				if (found) {
					possible.push(found);
					countSum += found.count;
				}
			}

			const r = Math.random() * countSum;
			let sum = 0;
			for (const p of possible) {
				sum += p.count;
				if (sum >= r) {
					currGuess = p;
					break;
				}
			}
		}

		if (!currGuess) {
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
		console.log('card', card);
	}
	console.log('root', root);
}

function shuffle() {
	deck = [];
	const cards = generateCards();
	do {
		const cardIndex = Math.floor(Math.random() * cards.length);
		deck.push(cards[cardIndex]);
		cards.splice(cardIndex, 1);
	} while (cards.length > 0);
	refreshDeck();
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
		html += `<img class="card" src="images/${filename}"/>`;
	}
	document.getElementById('deck').innerHTML = html;
}
