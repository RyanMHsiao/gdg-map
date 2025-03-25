class MultiMatcher {
	constructor(s, d) {
		this.str = s;
		this.next = [];
		this.data = d;
	}

	insert(x, dat) {
		// there are 3 cases:
		// the entire string x is a substring of this.str,
		// 	and x may equal this.str
		// the entire string this.str is a substring of x,
		// 	but x is not equal to this.str
		// x[0...n] is a substring of this.str[0...n]
		// 	where n < min(this.str.length, x.length)
		let same = 0;
		let ml = 0;
		if (x.length > this.str.length)
			ml = this.str.length;
		else
			ml = x.length;
		while (same < ml && this.str[same] == x[same]) {
			same++;
		}
		if (same == x.length) {
			if (this.str.length != same) {
				this.next.push(new MultiMatcher(this.str.slice(same), this.data));
				this.str = x;
			}
			this.data = dat;
		} else if (same == this.str.length) {
			x = x.slice(same);
			for (const n of this.next) {
				if (n.str.length > 0 && n.str[0] == x[0])
					return n.insert(x, dat);
			}
			this.next.push(new MultiMatcher(x, dat));
		} else {
			let a = new MultiMatcher(x.slice(same), dat);
			let b = new MultiMatcher(this.str.slice(same), this.data);
			b.next = this.next;
			this.str = x.slice(0, same);
			this.next = [a, b];
			this.data = null;
		}
	}

	// match is case insensitive for the input, x[i...x.length]
	// HOWEVER: the instance owner must ensure inserted strings are
	// lowercase, as ONLY x is made lowercase during the match
	match(x) {
		let i = 0;
		let same = 0;
		let ml = 0;
		let l = 0;
		let cur = this;
	again:
		for (;;) {
			if (x.length - i > cur.str.length)
				ml = cur.str.length + i;
			else
				ml = x.length;
			while (same < ml && cur.str[same - i] == x[same].toLowerCase()) {
				same++;
			}
			l = same - i;
			if (same == x.length)
				return cur;
			for (const n of cur.next) {
				if (n.str.length > 0 && n.str[0] == x[same].toLowerCase()) {
					cur = n;
					i = same;
					continue again;
				}
			}
			return null;
		}
	}

	walk(act) {
		act(this.data);
		for (const n of this.next) {
			n.walk(act);
		}
	}
}

const sbInput = document.getElementById("searchbar-data");
const sbResults = document.getElementById("searchbar-results");
const afTargets = new MultiMatcher("", null);

function setupAutofill() {
	// populate afTargets
	// Not using simple <p> elements with data-alt for synonyms anymore?
	// Update this section to properly extract the target values from the
	// elements under sbResults
	for (let entry of sbResults.children) {
		entry.onclick = (ev) => {
			ev.stopPropagation();
			sbInput.value = ev.target.innerHTML;
			for (let entry of sbResults.children) {
				entry.hidden = true;
			}
			// TODO: do the search, move and zoom map, etc.
			// perhaps call searchbar.mjs:focusOn
			// perhaps merge this file into searchbar.mjs
		};
		let altNames = entry.dataset["alt"];
		if (altNames) {
			altNames = altNames.split(',');
			for (const n of altNames) {
				afTargets.insert(n.toLowerCase(), entry);
			}
		}
		afTargets.insert(entry.innerHTML.toLowerCase(), entry);
	}
	sbInput.addEventListener("focus", () => sbInput.select());
	sbInput.addEventListener("input", (ev) => {
		// Here, we go over the input string completely each call even
		// if only one character changed, because the event does not
		// seem to tell me where the change occured
		for (let entry of sbResults.children) {
			entry.hidden = true;
		}
		let found = afTargets.match(sbInput.value);
		if (found && found != afTargets) {
			found.walk((v) => {
				if (v)
					v.hidden = false;
			});
		}
	});
}

export { setupAutofill };
