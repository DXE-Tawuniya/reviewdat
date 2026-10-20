<script>
	import '../app.css';
	import { page } from '$app/state';
	import { translator } from '$lib/i18n.js';
	import { House, Search, Plus, Clock, CircleUser } from '@lucide/svelte';

	let { data, children } = $props();
	const t = $derived(translator(data.lang));
	const path = $derived(page.url.pathname);
	const tabs = [
		{ href: '/', key: 'home', icon: House, match: (p) => p === '/' },
		{ href: '/search', key: 'search', icon: Search, match: (p) => p.startsWith('/search') },
		{ href: '/write', key: 'write', icon: Plus, match: (p) => p.startsWith('/write') || p.endsWith('/review') || p === '/items/new' },
		{ href: '/activity', key: 'activity', icon: Clock, match: (p) => p.startsWith('/activity') || p.startsWith('/reviews') },
		{ href: '/profile', key: 'profile', icon: CircleUser, match: (p) => p.startsWith('/profile') || p.startsWith('/admin') || p === '/login' || p === '/register' }
	];
</script>

<div class="app">
	{@render children()}
</div>

<nav class="bottom" aria-label="Main">
	{#each tabs as tab (tab.key)}
		<a href={tab.href} class:write={tab.key === 'write'} aria-current={tab.match(path) ? 'page' : undefined}>
			<span aria-hidden="true"><tab.icon size={24} /></span>{t(tab.key)}
		</a>
	{/each}
</nav>
