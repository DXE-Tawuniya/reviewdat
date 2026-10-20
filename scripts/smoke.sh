#!/usr/bin/env bash
# End-to-end smoke test against a running server.
# Usage: BASE=http://localhost:3000 bash scripts/smoke.sh
set -u
BASE=${BASE:-http://localhost:3000}
J=$(mktemp -d); U=$J/user.txt; A=$J/admin.txt
pass=0; failn=0
ok(){ echo "  ✓ $1"; pass=$((pass+1)); }
no(){ echo "  ✗ $1"; failn=$((failn+1)); }
check(){ if eval "$2"; then ok "$1"; else no "$1"; fi; }
post(){ curl -s -H "Accept: text/html" -o "$J/out" -w '%{http_code} %{redirect_url}' -H "Origin: $BASE" "$@"; }

echo "Guest browsing"
check "home 200" '[ "$(curl -s -o /dev/null -w %{http_code} $BASE/)" = 200 ]'
check "home lists seeded item" 'curl -s $BASE/ | grep -q "Aeropress"'
check "search finds item" 'curl -s "$BASE/search?q=notion" | grep -q "Notion"'
check "category filter" 'curl -s "$BASE/search?cat=place" | grep -q "Hilton" && ! curl -s "$BASE/search?cat=place" | grep -q "Aeropress"'
check "item page shows score" 'curl -s $BASE/items/1 | grep -q "bignum"'
check "guest write redirects to login" 'curl -s -o /dev/null -w "%{redirect_url}" $BASE/items/1/review | grep -q "/login?next="'
check "guest helpful vote redirects" '[ "$(post -X POST -d review_id=1 $BASE/items/1?/helpful | cut -c1-3)" = 303 ]'
check "unknown item 404" '[ "$(curl -s -o /dev/null -w %{http_code} $BASE/items/9999)" = 404 ]'

echo "Accounts"
check "register" 'post -c $U -X POST --data "name=Tester&email=tester$RANDOM@example.com&password=secret123&next=/" $BASE/register | grep -q "^303"'
check "session works" 'curl -s -b $U $BASE/profile | grep -q "Tester"'
check "bad login rejected" 'post -X POST --data "email=admin@reviewdat.local&password=nope" $BASE/login | grep -q "^400"'

echo "Review flow"
BEFORE=$(curl -s $BASE/items/7 | grep -o 'bignum[^>]*>[0-9.]*' | grep -o '[0-9.]*$')
head -c 60000 /dev/urandom > $J/receipt.png
printf '\x89PNG' | cat - $J/receipt.png > $J/r.png
R=$(curl -s -H "Accept: text/html" -o $J/out -w '%{http_code} %{redirect_url}' -b $U -H "Origin: $BASE" -X POST \
  -F "method=receipt" -F "extra=1to6m" -F "c_quality=2" -F "c_value=2" -F "c_durability=1" -F "c_accuracy=2" \
  -F "rating=1" -F "text=Stopped holding charge after two weeks of normal daily use." -F "pros=Size" -F "cons=Battery" \
  -F "proof=@$J/r.png;type=image/png" $BASE/items/7/review)
check "submit review → redirect to status" 'echo "$R" | grep -q "^303 .*/reviews/[0-9]*?new=1"'
RID=$(echo "$R" | grep -o '/reviews/[0-9]*' | grep -o '[0-9]*$')
check "status page shows published" 'curl -s -b $U $BASE/reviews/$RID | grep -q "Published"'
AFTER=$(curl -s $BASE/items/7 | grep -o 'bignum[^>]*>[0-9.]*' | grep -o '[0-9.]*$')
check "aggregate dropped ($BEFORE → $AFTER)" 'awk "BEGIN{exit !($AFTER < $BEFORE)}"'
check "second review same item blocked" 'curl -s -o /dev/null -w "%{redirect_url}" -b $U $BASE/items/7/review | grep -q "/reviews/$RID"'
R2=$(post -b $U -X POST -F "method=receipt" -F "extra=1to6m" -F "c_quality=5" -F "c_value=5" -F "c_durability=5" -F "c_accuracy=5" \
  -F "rating=5" -F "text=Reusing the same receipt file should be rejected by hash." -F "proof=@$J/r.png;type=image/png" $BASE/items/1/review)
check "duplicate receipt rejected" 'echo "$R2" | grep -q "^400" && grep -q "already used" $J/out'
R3=$(post -b $U -X POST -F "method=receipt" -F "extra=1to6m" -F "c_quality=5" -F "rating=5" -F "text=short" -F "proof=@$J/r.png;type=image/png" $BASE/items/2/review)
check "incomplete review rejected" 'echo "$R3" | grep -q "^400"'
check "activity lists review" 'curl -s -b $U $BASE/activity | grep -q "Stopped holding charge"'

echo "Add item"
NAME="Smoke Kettle $RANDOM"
R4=$(post -b $U -X POST --data-urlencode "name=$NAME" -d "category=product&region=Global&link=https://example.com/kettle" $BASE/items/new)
check "create item → wizard" 'echo "$R4" | grep -q "^303 .*/items/[0-9]*/review"'
R5=$(post -b $U -X POST --data-urlencode "name=$NAME" -d "category=product&link=https://example.com/k" $BASE/items/new)
check "duplicate item → existing" 'echo "$R5" | grep -q "?dup=1"'
check "item without existence proof rejected" 'post -b $U -X POST -d "name=Nothing+Proof&category=product" $BASE/items/new | grep -q "^400"'

echo "Votes, reports, moderation"
check "helpful vote" '[ "$(post -b $U -X POST -d review_id=1 "$BASE/items/1?/helpful" | cut -c1-3)" = 200 ]'
check "report review" '[ "$(post -b $U -X POST -d "review_id=1&reason=spam" "$BASE/items/1?/report" | cut -c1-3)" = 200 ]'
check "non-admin blocked from admin" 'curl -s -o /dev/null -w "%{redirect_url}" -b $U $BASE/admin | grep -q "/$"'
post -c $A -X POST --data "email=admin@reviewdat.local&password=admin1234&next=/admin" $BASE/login >/dev/null
check "admin sees report" 'curl -s -b $A $BASE/admin | grep -q "Makes a clean cup"'
check "admin hides review" '[ "$(post -b $A -X POST -d review_id=1 "$BASE/admin?/hide" | cut -c1-3)" = 200 ]'
check "hidden review gone from item" '! curl -s $BASE/items/1 | grep -q "Makes a clean cup"'
check "admin restores review" '[ "$(post -b $A -X POST -d review_id=1 "$BASE/admin?/restore" | cut -c1-3)" = 200 ] && curl -s $BASE/items/1 | grep -q "Makes a clean cup"'

echo "i18n & security"
check "Arabic + RTL" 'curl -s -b "lang=ar" $BASE/ | grep -q "dir=\"rtl\"" && curl -s -b "lang=ar" $BASE/ | grep -q "الرئيسية"'
check "cross-origin POST blocked" '[ "$(curl -s -o /dev/null -w %{http_code} -H "Origin: https://evil.example" -b $U -X POST -d review_id=2 "$BASE/items/2?/helpful")" = 403 ]'
check "proof files not public" '[ "$(curl -s -o /dev/null -w %{http_code} $BASE/media/$(sha256sum $J/r.png | cut -c1-64).png)" = 404 ]'
check "open redirect blocked" 'post -X POST --data "email=admin@reviewdat.local&password=admin1234&next=//evil.example" $BASE/login | grep -q " http[^ ]*localhost[^ ]*/$\| /$"'

echo; echo "Passed $pass · Failed $failn"; rm -rf "$J"; [ $failn -eq 0 ]
