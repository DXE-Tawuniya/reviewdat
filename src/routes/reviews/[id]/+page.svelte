<script>
	import { Check, X } from '@lucide/svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import { translator } from '$lib/i18n.js';

	let { data } = $props();
	const t = $derived(translator(data.lang));
	const r = $derived(data.review);
	const stages = $derived([
		{ label: t('submitted'), done: true },
		{ label: t('proofVerified') + (r.confidence ? ` · ${Math.round(r.confidence * 100)}%` : ''), done: r.proof_status === 'approved' || (!r.proof_id && r.status === 'published'), failed: r.proof_status === 'rejected' },
		{ label: r.status === 'hidden' ? t('hidden') : t('published'), done: r.status === 'published', failed: r.status === 'hidden' || r.status === 'rejected' }
	]);
</script>

<svelte:head><title>{r.item_name} · reviewdat</title></svelte:head>

<TopBar title={r.item_name} back="/items/{r.item_id}" lang={data.lang} />
<main>
	{#if data.isOwner}
		<div class="card pipeline" aria-label={t('status')}>
			{#each stages as s, i (i)}
				<div class="stage">
					<span class="dot" class:done={s.done} class:failed={s.failed}>{#if s.done}<Check size={14} strokeWidth={3} />{:else if s.failed}<X size={14} strokeWidth={3} />{/if}</span>
					<span class:muted={!s.done}>{s.label}</span>
				</div>
			{/each}
		</div>
	{/if}
	<ReviewCard review={r} {t} lang={data.lang} showItem status={data.isOwner ? r.status : null} />
	<a class="btn block" href="/items/{r.item_id}">{t('viewItem')}</a>
</main>

<style>
	.pipeline { display: flex; flex-direction: column; gap: 10px; }
	.stage { display: flex; gap: 10px; align-items: center; }
	.dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line); display: grid; place-items: center; font-size: 12px; flex: none; color: var(--surface); }
	.dot.done { background: var(--success); border-color: var(--success); color: var(--surface); }
	.dot.failed { background: var(--danger); border-color: var(--danger); color: var(--surface); }
</style>
