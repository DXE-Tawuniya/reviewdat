<script>
	import { Search } from '@lucide/svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import ItemRow from '$lib/components/ItemRow.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import CategoryChips from '$lib/components/CategoryChips.svelte';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
</script>

<svelte:head><title>reviewdat</title></svelte:head>

<TopBar title="reviewdat" wordmark lang={data.lang} />
<main>
	<div class="sec">
		<p class="headline">{t('tagline')}</p>
		<form class="searchbar" action="/search" role="search">
			<input name="q" placeholder={t('searchPh')} aria-label={t('search')} />
			<button class="btn small" aria-label={t('search')}><Search size={20} aria-hidden="true" /></button>
		</form>
	</div>

	<div class="sec">
		<h2>{t('categories')}</h2>
		<CategoryChips {t} current={data.cat} base="/" />
	</div>

	<div class="sec">
		<h2>{t('topRated')}</h2>
		{#each data.top as item (item.id)}<ItemRow {item} {t} />{:else}<div class="empty">{t('nothing')}</div>{/each}
	</div>

	<div class="sec">
		<h2>{t('latest')}</h2>
		{#each data.recent as review (review.id)}
			<ReviewCard {review} {t} lang={data.lang} showItem voted={data.voted.includes(review.id)} helpful={review.helpful} />
		{/each}
	</div>
</main>
