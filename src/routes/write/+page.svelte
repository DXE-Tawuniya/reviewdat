<script>
	import { Search } from '@lucide/svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import ItemRow from '$lib/components/ItemRow.svelte';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
</script>

<svelte:head><title>{t('write')} · reviewdat</title></svelte:head>

<TopBar title={t('write')} lang={data.lang} />
<main>
	<div class="sec">
		<p class="headline">{t('pickItem')}</p>
		<p class="muted" style="margin:0">{t('pickItemSub')}</p>
		{#if !data.user}<div class="notice">{t('gateBody')}</div>{/if}
	</div>
	<form class="searchbar" role="search">
		<input name="q" value={data.q} placeholder={t('searchPh')} aria-label={t('search')} />
		<button class="btn small" aria-label={t('search')}><Search size={20} aria-hidden="true" /></button>
	</form>
	<div class="sec">
		{#each data.results as item (item.id)}<ItemRow {item} {t} href="/items/{item.id}/review" />{:else}<div class="empty">{t('noResults')}</div>{/each}
		<a class="btn ghost block" href="/items/new{data.q ? '?name=' + encodeURIComponent(data.q) : ''}">+ {t('addItem')}</a>
	</div>
</main>
