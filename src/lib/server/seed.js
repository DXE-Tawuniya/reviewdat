import { hashPassword } from './password.js';

const DAY = 864e5;

/** Example data so the app opens with real-looking content. */
export function seed(db) {
	const now = Date.now();
	const addUser = db.prepare(
		'INSERT INTO users (name,email,password_hash,role,trust,created_at) VALUES (?,?,?,?,?,?)'
	);
	const pw = hashPassword('demo1234');
	addUser.run('Admin', 'admin@reviewdat.local', hashPassword('admin1234'), 'admin', 90, now);
	const people = ['Sara K.', 'Omar H.', 'Lena M.', 'Faisal A.', 'Mei L.', 'Noura S.', 'Ahmed R.', 'Khalid B.', 'Dana W.', 'Yusuf T.', 'Priya N.', 'Tom G.', 'Hessa M.'];
	const uid = {};
	people.forEach((p, i) => {
		const email = p.toLowerCase().replace(/[^a-z]/g, '') + '@example.com';
		uid[p] = addUser.run(p, email, pw, 'user', 45 + ((i * 7) % 40), now - 400 * DAY).lastInsertRowid;
	});

	const addItem = db.prepare(
		'INSERT INTO items (name,category,region,link,created_by,created_at) VALUES (?,?,?,?,?,?)'
	);
	const items = [
		['Aeropress Go Coffee Maker', 'product', 'Global', 'https://aeropress.com'],
		['Sony WH-1000XM6 Headphones', 'product', 'Global', 'https://sony.com'],
		['Al Baik — Tahlia St, Jeddah', 'place', 'Saudi Arabia', 'https://maps.google.com/?q=albaik+tahlia'],
		['QuickFix Home AC Maintenance', 'service', 'Saudi Arabia', null],
		['Notion (Plus plan)', 'digital', 'Global', 'https://notion.so'],
		['Hilton Garden Inn Dubai Mall', 'place', 'UAE', 'https://hilton.com'],
		['Anker 737 Power Bank', 'product', 'Global', 'https://anker.com'],
		['Figma Professional', 'digital', 'Global', 'https://figma.com']
	];
	const iid = items.map((it) => addItem.run(...it, 1, now - 300 * DAY).lastInsertRowid);

	const addReview = db.prepare(
		`INSERT INTO reviews (item_id,user_id,proof_method,rating,criteria,extra,text,pros,cons,status,created_at,published_at)
     VALUES (?,?,?,?,?,?,?,?,?,'published',?,?)`
	);
	const R = (i, who, rating, text, days, crit, method = 'receipt', extra = null, pros = '', cons = '') => {
		const t = now - days * DAY;
		addReview.run(iid[i], uid[who], method, rating, JSON.stringify(crit), extra, text, pros, cons, t, t);
	};
	R(0, 'Sara K.', 5, 'Makes a clean cup every morning. Packs into its own mug for travel. Plunger seal still tight after a year.', 12, { quality: 5, value: 5, durability: 5, accuracy: 5 }, 'email', 'gt6m', 'Portable, consistent', 'Small capacity');
	R(0, 'Omar H.', 4, 'Great coffee, slightly fiddly cleanup. Filters are cheap and easy to find locally.', 40, { quality: 5, value: 4, durability: 4, accuracy: 4 }, 'receipt', '1to6m');
	R(0, 'Lena M.', 5, 'Bought a second one for the office. Consistent results with almost no learning curve.', 90, { quality: 5, value: 5, durability: 5, accuracy: 5 }, 'receipt', 'gt6m');
	R(1, 'Faisal A.', 5, 'Noise cancelling on flights is excellent. Battery lasted a full week of commuting.', 5, { quality: 5, value: 4, durability: 5, accuracy: 5 }, 'email', '1to6m');
	R(1, 'Mei L.', 3, 'Sound is great but ear cups get warm in summer. Touch controls misfire in rain.', 30, { quality: 4, value: 3, durability: 4, accuracy: 3 }, 'receipt', 'lt1m', 'Sound', 'Heat, touch controls');
	R(2, 'Noura S.', 5, 'Fast queue even at 10pm. Broast was hot and crisp, staff were quick.', 3, { clean: 5, staff: 5, location: 4, value: 5 }, 'receipt', 'family');
	R(2, 'Ahmed R.', 4, 'Busy parking on weekends. Food quality is consistent with other branches.', 20, { clean: 4, staff: 4, location: 3, value: 5 }, 'receipt', 'solo');
	R(3, 'Khalid B.', 2, 'Technician arrived three hours late. Unit works now but the price changed on site.', 8, { pro: 3, time: 1, price: 2, outcome: 4 }, 'invoice', 'month');
	R(4, 'Dana W.', 4, 'Databases changed how our team plans sprints. Offline mode still weak.', 15, { ease: 4, reliable: 4, support: 3, value: 4 }, 'email', 'gt1y');
	R(4, 'Yusuf T.', 5, 'Replaced three tools for us. Support answered within a day.', 60, { ease: 5, reliable: 5, support: 5, value: 5 }, 'email', '1to12m');
	R(5, 'Priya N.', 4, 'Walkable to the mall, clean rooms. Breakfast crowded after 9.', 25, { clean: 5, staff: 4, location: 5, value: 3 }, 'booking', 'business');
	R(6, 'Tom G.', 5, 'Charges a laptop and phone together. Display shows exact remaining percent.', 10, { quality: 5, value: 4, durability: 5, accuracy: 5 }, 'receipt', '1to6m');
	R(7, 'Hessa M.', 5, 'Dev mode and variables save hours every week on our design system.', 7, { ease: 4, reliable: 5, support: 4, value: 5 }, 'email', 'gt1y');
}
