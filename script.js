document.addEventListener("DOMContentLoaded", function() {
	const yearSpan = document.getElementById("copyright-year");
	if(yearSpan){ yearSpan.textContent = new Date().getFullYear(); }
});
// UPSM Sports Day - Results logic
// - Calculates totals from score cells in HTML
// - Keeps table sorted by highest total on top (on load)

(function(){
	const table = document.getElementById('results-table');
	if(!table) return;

	const tbody = table.querySelector('tbody');

		// Set 'Last updated' using the page's last modified timestamp
		const lastUpdatedEl = document.getElementById('last-updated');
		if(lastUpdatedEl){
			const d = new Date(document.lastModified);
			const formatted = d.toLocaleString(undefined, {
				year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'
			});
			lastUpdatedEl.textContent = `Last updated: ${formatted}`;
		}

		function parseScore(text){
		// Allow numbers like 10, 10.5; treat blank/invalid as 0
		const cleaned = String(text).replace(/[^0-9.\-]/g, '').trim();
		const n = parseFloat(cleaned);
		return Number.isFinite(n) ? n : 0;
	}

	function rowTotal(tr){
		let sum = 0;
		tr.querySelectorAll('td.score').forEach(td => {
			sum += parseScore(td.textContent);
		});
		return sum;
	}

	function updateTotals(){
		tbody.querySelectorAll('tr').forEach(tr => {
			const totalCell = tr.querySelector('td.total');
			const total = rowTotal(tr);
			if(totalCell){ totalCell.textContent = String(total); }
			tr.dataset.total = String(total);
		});
	}

	function sortRowsDesc(){
		const rows = Array.from(tbody.querySelectorAll('tr'));
		rows.sort((a,b)=> (parseFloat(b.dataset.total||'0') - parseFloat(a.dataset.total||'0')) || a.dataset.team.localeCompare(b.dataset.team));
		// Re-append in new order
		const frag = document.createDocumentFragment();
		rows.forEach(r => frag.appendChild(r));
		tbody.appendChild(frag);
	}

		// Calculate and sort on load
		updateTotals();
		sortRowsDesc();

		// Render podium (top 3)
		function renderPodium(){
			const podium = document.getElementById('podium');
			if(!podium) return;
			const rows = Array.from(tbody.querySelectorAll('tr'));
			const top3 = rows.slice(0,3).map(tr => ({
				team: tr.querySelector('th.team')?.textContent?.trim() || '',
				color: tr.dataset.team || '',
				total: parseFloat(tr.dataset.total || '0') || 0
			}));
			const positions = [
				{pos:1, sel:'.podium-step.first'},
				{pos:2, sel:'.podium-step.second'},
				{pos:3, sel:'.podium-step.third'}
			];
			positions.forEach((p, idx)=>{
				const el = podium.querySelector(p.sel);
				if(!el) return;
				const item = top3[idx];
				if(!item){ el.innerHTML = '<div class="podium-card"><div class="podium-name">—</div><div class="podium-score">0</div></div>'; return; }
				el.innerHTML = `
					<div class="podium-card">
						<div class="podium-name"><span class="badge" data-team="${item.color}"></span>${item.team}</div>
						<div class="podium-score">${item.total}</div>
					</div>`;
			});
		}

		renderPodium();
})();

