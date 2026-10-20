<script>
	import { onMount } from 'svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
	let drafts = $state([]);

	onMount(() => {
		try {
			const out = [];
			for (let i = 0; i < localStorage.length; i++) {
				const k = localStorage.key(i);
				if (!k?.startsWith('rd_draft_')) continue;
				const d = JSON.parse(localStorage.getItem(k));
				out.push({ id: k.slice(9), name: d.item, at: d.at });
			}
			drafts = out.sort((a, b) => b.at - a.at);
		} catch { /* storage unavailable */ }
	});
</script>

<svelte:head><title>{t('activity')} · reviewdat</title></svelte:head>

<TopBar title={t('activity')} lang={data.lang} />
<main>
	{#if drafts.length}
		<div class="sec">
			<h2>{t('drafts')}</h2>
			{#each drafts as d (d.id)}
				<div class="card row between"><span>{d.name}</span><a class="btn ghost small" href="/items/{d.id}/review">{t('resume')}</a></div>
			{/each}
		</div>
	{/if}
	<div class="sec">
		<h2>{t('myReviews')}</h2>
		{#each data.mine as review (review.id)}
			<a href="/reviews/{review.id}" class="small muted">#{review.id}</a>
			<ReviewCard {review} {t} lang={data.lang} showItem status={review.status} helpful={review.helpful} />
		{:else}
			<div class="empty">{t('nothing')}</div>
			<a class="btn block" href="/write">{t('writeReview')}</a>
		{/each}
	</div>
</main>
