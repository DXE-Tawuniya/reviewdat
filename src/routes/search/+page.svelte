<script>
	import { Search } from '@lucide/svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import ItemRow from '$lib/components/ItemRow.svelte';
	import CategoryChips from '$lib/components/CategoryChips.svelte';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
</script>

<svelte:head><title>{t('search')} · reviewdat</title></svelte:head>

<TopBar title={t('search')} lang={data.lang} />
<main>
	<form class="searchbar" role="search">
		<input name="q" value={data.q} placeholder={t('searchPh')} aria-label={t('search')} />
		{#if data.cat !== 'all'}<input type="hidden" name="cat" value={data.cat} />{/if}
		<button class="btn small" aria-label={t('search')}><Search size={20} aria-hidden="true" /></button>
	</form>
	<CategoryChips {t} current={data.cat} base="/search" params={data.q ? { q: data.q } : {}} />
	<div class="sec">
		{#each data.results as item (item.id)}<ItemRow {item} {t} />{:else}<div class="empty">{t('noResults')}</div>{/each}
		<a class="btn ghost block" href="/items/new{data.q ? '?name=' + encodeURIComponent(data.q) : ''}">+ {t('addItem')}</a>
	</div>
</main>
