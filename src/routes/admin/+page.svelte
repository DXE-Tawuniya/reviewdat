<script>
	import { Flag } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import TopBar from '$lib/components/TopBar.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { PROOF_METHODS } from '$lib/templates.js';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
	const s = $derived(data.stats);
</script>

<svelte:head><title>{t('moderation')} · reviewdat</title></svelte:head>

<TopBar title={t('moderation')} back="/profile" lang={data.lang} />
<main>
	<div class="stats">
		<div class="card"><span class="mono n">{s.users}</span><span class="small muted">Users</span></div>
		<div class="card"><span class="mono n">{s.items}</span><span class="small muted">Items</span></div>
		<div class="card"><span class="mono n">{s.published}</span><span class="small muted">Published</span></div>
		<div class="card" class:alert={s.open > 0}><span class="mono n">{s.open}</span><span class="small muted">Open reports</span></div>
	</div>

	<div class="sec">
		<h2>{t('reportsOpen')}</h2>
		{#each data.reports as r (r.review_id)}
			<div class="card sec">
				<div class="row between"><strong>{r.item_name}</strong><span class="badge no">{r.n} <Flag aria-hidden="true" /></span></div>
				<div class="row"><Stars value={r.rating} /><span class="small muted">{r.author}</span></div>
				<p style="margin:0">{r.text}</p>
				<span class="small muted">{r.reasons}</span>
				<div class="row">
					<form method="POST" action="?/hide" use:enhance><input type="hidden" name="review_id" value={r.review_id} /><button class="btn small">{t('hide')}</button></form>
					<form method="POST" action="?/dismiss" use:enhance><input type="hidden" name="review_id" value={r.review_id} /><button class="btn ghost small">{t('dismiss')}</button></form>
				</div>
			</div>
		{:else}<div class="empty">{t('nothing')}</div>{/each}
	</div>

	<div class="sec">
		<h2>{t('hiddenReviews')}</h2>
		{#each data.hidden as r (r.id)}
			<div class="card row between">
				<span style="min-width:0"><strong>{r.item_name}</strong><br /><span class="small muted">{r.author} · {r.text.slice(0, 60)}…</span></span>
				<form method="POST" action="?/restore" use:enhance><input type="hidden" name="review_id" value={r.id} /><button class="btn ghost small">{t('restore')}</button></form>
			</div>
		{:else}<div class="empty">{t('nothing')}</div>{/each}
	</div>

	<div class="sec">
		<h2>{t('recentProofs')}</h2>
		<div class="tablewrap">
			<table>
				<thead><tr><th>#</th><th>Item</th><th>{t('method')}</th><th>{t('confidence')}</th><th>{t('status')}</th></tr></thead>
				<tbody>
					{#each data.proofs as p (p.id)}
						<tr>
							<td class="mono">{p.id}</td>
							<td>{p.item_name}<br /><span class="small muted">{p.author}</span></td>
							<td>{t.l(PROOF_METHODS[p.method])}</td>
							<td class="mono">{Math.round(p.confidence * 100)}%</td>
							<td><span class="badge {p.status === 'approved' ? 'ok' : p.status === 'rejected' ? 'no' : 'warn'}">{p.status}</span></td>
						</tr>
					{:else}<tr><td colspan="5" class="empty">{t('nothing')}</td></tr>{/each}
				</tbody>
			</table>
		</div>
	</div>
</main>

<style>
	.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
	.stats .card { display: flex; flex-direction: column; gap: 2px; }
	.n { font-size: 26px; font-weight: 600; }
	.alert { border-color: var(--danger); }
	.tablewrap { overflow-x: auto; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface-raised); }
	table { border-collapse: collapse; width: 100%; font-size: 14px; min-width: 420px; }
	th, td { text-align: start; padding: 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
	th { font: 600 11px/1.2 var(--font-sans); text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); }
	tr:last-child td { border-bottom: 0; }
</style>
