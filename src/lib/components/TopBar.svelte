<script>
	import { page } from '$app/state';
	import { ArrowLeft } from '@lucide/svelte';
	let { title, back = null, lang = 'en', wordmark = false } = $props();
</script>

<header class="top">
	{#if back}
		<a class="iconbtn" href={back} aria-label="Back"><ArrowLeft class="flip" size={24} aria-hidden="true" /></a>
	{/if}
	<h1>
		{#if wordmark}
			<img class="logo logo-light" src="/reviewdat-logo.svg" alt={title} />
			<img class="logo logo-dark" src="/reviewdat-logo-dark-bg.svg" alt={title} />
		{:else}
			{#if !back}<img class="logo" src="/reviewdat-mark.svg" alt="" />{/if}
			<span>{title}</span>
		{/if}
	</h1>
	<form method="POST" action="/lang">
		<input type="hidden" name="next" value={page.url.pathname + page.url.search} />
		<button class="pill" name="lang" value={lang === 'en' ? 'ar' : 'en'}>{lang === 'en' ? 'عربي' : 'EN'}</button>
	</form>
</header>
