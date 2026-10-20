<script>
	import { enhance } from '$app/forms';
	import TopBar from '$lib/components/TopBar.svelte';
	import { CATEGORIES } from '$lib/templates.js';
	import { translator } from '$lib/i18n.js';

	let { data, form } = $props();
	const t = $derived(translator(data.lang));
	let busy = $state(false);
</script>

<svelte:head><title>{t('addItem')} · reviewdat</title></svelte:head>

<TopBar title={t('addItem')} back="/write" lang={data.lang} />
<main>
	<form class="sec" method="POST" enctype="multipart/form-data" use:enhance={() => { busy = true; return async ({ update }) => { busy = false; await update({ reset: false }); }; }}>
		{#if form?.error}<div class="error" role="alert">{form.error}</div>{/if}
		<label class="f">{t('itemName')}<input class="input" id="name" name="name" required minlength="3" value={form?.name ?? data.name} /></label>
		<label class="f">{t('category')}
			<select class="input" id="category" name="category" required>
				{#each Object.entries(CATEGORIES) as [k, c] (k)}<option value={k} selected={form?.category === k}>{c.icon} {t.l(c)}</option>{/each}
			</select>
		</label>
		<label class="f">{t('region')}<input class="input" id="region" name="region" value={form?.region ?? 'Global'} /></label>
		<div class="card sec">
			<h2>{t('existTitle')}</h2>
			<p class="small muted" style="margin:0">{t('existBody')}</p>
			<label class="f">{t('link')}<input class="input" id="link" name="link" type="url" inputmode="url" placeholder="https://" value={form?.link ?? ''} /></label>
			<label class="f">{t('barcode')}<input class="input" id="barcode" name="barcode" inputmode="numeric" placeholder="6291041500213" value={form?.barcode ?? ''} /></label>
			<label class="f">{t('photo')}<input class="input" id="photo" name="photo" type="file" accept="image/*" capture="environment" /></label>
		</div>
		<button class="btn block" disabled={busy}>{t('create')}</button>
	</form>
</main>
