<script>
	import TopBar from '$lib/components/TopBar.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import { CATEGORIES } from '$lib/templates.js';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
	const c = $derived(CATEGORIES[data.item.category]);
	const s = $derived(data.summary);
	const maxd = $derived(Math.max(1, ...s.dist));
</script>

<svelte:head><title>{data.item.name} · reviewdat</title></svelte:head>

<TopBar title={data.item.name} back="/" lang={data.lang} />
<main>
	<div class="row">
		<div class="thumb" aria-hidden="true">
			{#if data.item.photo}<img src="/media/{data.item.photo}" alt="" />{:else}{c.icon}{/if}
		</div>
		<div style="min-width:0">
			<div class="small muted">{t.l(c)} · {data.item.region}</div>
			<strong>{data.item.name}</strong>
			{#if data.host}<div class="small"><a class="muted" href={data.item.link} rel="noopener nofollow" target="_blank">{data.host}</a></div>{/if}
		</div>
	</div>

	<div class="card big">
		{#if s.n}
			<div>
				<div class="bignum">{s.score.toFixed(1)}</div>
				<Stars value={s.score} size={16} />
				<div class="small muted mono">{s.n} {t('reviews')}</div>
			</div>
			<div class="dist">
				{#each [5, 4, 3, 2, 1] as star, i (star)}
					<div class="bar">
						<span class="mono">{star}</span>
						<div class="track"><div class="bar-fill" style="width:{(s.dist[i] / maxd) * 100}%"></div></div>
						<span class="mono muted">{s.dist[i]}</span>
					</div>
				{/each}
			</div>
		{:else}
			<div class="muted">{t('notEnough')}</div>
		{/if}
	</div>

	{#if s.n}
		<div class="card sec">
			<div class="row between"><h2>{t('breakdown')}</h2><span class="small muted">{t('formula')}</span></div>
			<div class="crit">
				{#each c.criteria as cr (cr.key)}
					<span>{t.l(cr)}</span><span class="mono">{s.criteria[cr.key]?.toFixed(1) ?? '—'}</span>
				{/each}
			</div>
			{#if !s.confident}<div class="notice small">{t('notEnoughNote')} ({s.raw.toFixed(1)})</div>{/if}
		</div>
	{/if}

	{#if data.mine}
		<a class="btn ghost block" href="/reviews/{data.mine.id}">{t('alreadyReviewed')} · {t('status_' + data.mine.status)}</a>
	{:else}
		<a class="btn block" href="/items/{data.item.id}/review">{t('writeReview')}</a>
	{/if}

	<div class="chips">
		{#each ['newest', 'highest', 'lowest', 'helpful'] as so (so)}
			<a class="chip" href="?sort={so}" aria-current={data.sort === so ? 'true' : undefined} data-sveltekit-noscroll>{t(so)}</a>
		{/each}
	</div>

	<div class="sec">
		{#each data.reviews as review (review.id)}
			<ReviewCard {review} {t} lang={data.lang} voted={data.voted.includes(review.id)} helpful={review.helpful} />
		{:else}
			<div class="empty">{t('nothing')}</div>
		{/each}
	</div>
</main>

<style>
	.big { display: flex; gap: 18px; align-items: center; }
	.bignum { font: 600 52px/1 var(--font-display); font-variant-numeric: tabular-nums; }
	.dist { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
	.bar { display: flex; gap: 8px; align-items: center; font-size: 13px; }
	.track { flex: 1; height: 8px; border-radius: 4px; background: var(--line); overflow: hidden; }
	.bar-fill { height: 100%; background: var(--rating); }
	.crit { display: grid; grid-template-columns: 1fr auto; gap: 6px 12px; font-size: 14px; }
</style>
