<script>
	import { Check, ThumbsUp, Flag, Plus, Minus } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import Stars from './Stars.svelte';
	import { CATEGORIES } from '$lib/templates.js';

	let { review, t, lang, showItem = false, voted = false, helpful = 0, status = null } = $props();
	const cat = $derived(CATEGORIES[review.item_category]);
	const extraLabel = $derived.by(() => {
		const c = cat ?? Object.values(CATEGORIES).find((c) => c.extra.options.some((o) => o.value === review.extra));
		const o = c?.extra.options.find((o) => o.value === review.extra);
		return o ? t.l(o) : '';
	});
	const date = $derived(
		new Date(review.published_at ?? review.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
	);
	let reported = $state(false);
</script>

<article class="card review">
	<div class="row between">
		<strong>{review.user_name}</strong>
		<span class="small muted">{date}</span>
	</div>
	{#if showItem}<a class="itemlink" href="/items/{review.item_id}">{review.item_name}</a>{/if}
	<div class="row wrap">
		<Stars value={review.rating} />
		{#if status && status !== 'published'}
			<span class="badge {status === 'hidden' || status === 'rejected' ? 'no' : 'warn'}">{t('status_' + status)}</span>
		{:else}
			<span class="badge ok"><Check strokeWidth={3} aria-hidden="true" /> {t('verified')}</span>
		{/if}
		{#if extraLabel}<span class="small muted">{extraLabel}</span>{/if}
	</div>
	<p>{review.text}</p>
	{#if review.pros || review.cons}
		<p class="small pc">
			{#if review.pros}<span class="pro"><Plus size={14} aria-hidden="true" /> {review.pros}</span>{/if}
			{#if review.cons}<span class="con"><Minus size={14} aria-hidden="true" /> {review.cons}</span>{/if}
		</p>
	{/if}
	{#if !status || status === 'published'}
		<div class="row">
			<form method="POST" action="/items/{review.item_id}?/helpful" use:enhance={() => ({ update }) => update({ reset: false, invalidateAll: true })}>
				<input type="hidden" name="review_id" value={review.id} />
				<button class="linkbtn" aria-pressed={voted}><ThumbsUp size={16} aria-hidden="true" /> {t('helpful')} <span class="mono">{helpful}</span></button>
			</form>
			<form method="POST" action="/items/{review.item_id}?/report" use:enhance={() => ({ result, update }) => { if (result.type === 'success') reported = true; else update(); }}>
				<input type="hidden" name="review_id" value={review.id} />
				<input type="hidden" name="reason" value="flagged" />
				<button class="linkbtn" disabled={reported}><Flag size={16} aria-hidden="true" /> {reported ? t('reportedThanks') : t('report')}</button>
			</form>
		</div>
	{/if}
</article>

<style>
	.review { display: flex; flex-direction: column; gap: 6px; }
	p { margin: 0; overflow-wrap: anywhere; }
	.itemlink { font-weight: 600; color: var(--ink-muted); font-size: 14px; text-decoration: none; }
	.pc { display: flex; flex-direction: column; }
	.pro, .con { display: flex; gap: var(--space-1); align-items: baseline; }
	.pro :global(svg), .con :global(svg) { flex: none; transform: translateY(2px); }
	.pro { color: var(--success); }
	.con { color: var(--danger); }
</style>
