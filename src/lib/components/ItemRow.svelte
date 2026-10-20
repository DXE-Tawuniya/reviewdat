<script>
	import { Star } from '@lucide/svelte';
	import { CATEGORIES } from '$lib/templates.js';
	let { item, t, href = `/items/${item.id}` } = $props();
	const c = $derived(CATEGORIES[item.category]);
</script>

<a class="item" {href}>
	<div class="thumb" aria-hidden="true">
		{#if item.photo}<img src="/media/{item.photo}" alt="" />{:else}{c.icon}{/if}
	</div>
	<div class="meta">
		<div class="name">{item.name}</div>
		<div class="small muted">{t.l(c)} · {item.region}</div>
	</div>
	<div class="score">
		{#if item.n > 0}<span class="s"><Star size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" /></span>{item.score.toFixed(1)}{:else}—{/if}
		<span class="small muted mono">{item.n}</span>
	</div>
</a>

<style>
	.item { display: flex; gap: 12px; align-items: center; background: var(--surface-raised); border: 1px solid var(--line); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); padding: var(--space-3); text-decoration: none; }
	.item:hover { border-color: var(--brand); }
	.meta { flex: 1; min-width: 0; }
	.name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.score { font: 600 15px/1 var(--font-display); display: flex; align-items: center; gap: 4px; font-variant-numeric: tabular-nums; }
	.s { color: var(--rating); display: inline-flex; }
</style>
