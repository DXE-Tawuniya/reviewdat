<script>
	import { CATEGORIES } from '$lib/templates.js';
	let { t, current = 'all', base = '/', params = {} } = $props();
	const href = (cat) => {
		const p = new URLSearchParams({ ...params, ...(cat === 'all' ? {} : { cat }) });
		const s = p.toString();
		return s ? `${base}?${s}` : base;
	};
</script>

<div class="chips">
	<a class="chip" href={href('all')} aria-current={current === 'all' ? 'true' : undefined}>{t('all')}</a>
	{#each Object.entries(CATEGORIES) as [key, c] (key)}
		<a class="chip" href={href(key)} aria-current={current === key ? 'true' : undefined}>{c.icon} {t.l(c)}</a>
	{/each}
</div>
