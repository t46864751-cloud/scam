---
Task ID: 1
Agent: Main
Task: Security fixes for scam project - vulnerabilities 1, 2, 4, 5, 6, 7

Work Log:
- Analyzed project for security vulnerabilities using subagent
- Fixed vulnerability 1: Removed hardcoded admin password fallback 'gFgtqc' from panel/register/route.ts. Now ADMIN_PASSWORD is required from env, returns 500 if not set.
- Fixed vulnerability 2: Added admin auth check to /api/migrate/route.ts and /api/seed-statuses/route.ts. Both endpoints now require admin session.
- Fixed vulnerability 4: Confirmed .env*.local in .gitignore. Removed .env from git tracking (git rm --cached). Cleaned up duplicate .vercel entry in .gitignore.
- Fixed vulnerability 5: Created src/middleware.ts with JWT-based admin role check for all /api/panel/* and /panel/* routes.
- Fixed vulnerability 6: Changed password policy in auth/register/route.ts: min 8 chars (was 6), requires at least one letter and one digit.
- Fixed vulnerability 7: Created src/lib/rate-limit.ts with in-memory rate limiter. Added rate limiting to: login (auth.ts authorize), registration (register/route.ts), admin password (panel/register/route.ts). Max 10 attempts per minute per key.
- Committed all changes and pushed to GitHub.
- Attempted deployment via Vercel CLI - all builds fail with "The Deployment was blocked because GitHub could not associate the committer with a GitHub user" - Vercel can't link GitHub user t46864751-cloud to Vercel user t46864751-7462.

Stage Summary:
- All 6 security fixes implemented and committed
- GitHub push successful: https://github.com/t46864751-cloud/scam
- Vercel deployment blocked due to GitHub committer not matching Vercel team member
- User needs to either: link GitHub account to Vercel, or disable Git integration on Vercel, or deploy manually from Vercel dashboard

---
Task ID: 2
Agent: Main
Task: Найти и исправить все баги, связанные с EXP системой

Analysis (найденные баги):

БАГ #1 (КРИТИЧНЫЙ): Полностью отсутствует автоматическое начисление EXP по правилам.
- ExpRule описывает: actionType (submission/comment/search), status (approved/rejected/all), threshold (каждые N), expReward.
- НИГДЕ в коде правила не применяются:
  * /api/panel/submissions PUT меняет статус, но не вызывает начисление
  * /api/panel/comments PUT action='approve' не вызывает начисление
  * /api/search GET не вызывает начисление
  * /api/comments POST создаёт коммент, не вызывает начисление
- EXP можно изменить только вручную через /api/panel/users/exp (админ-накрутка).
- Правила в админке создаются, но бесполезны.

БАГ #2: /api/panel/users/exp не конвертирует amount в Number.
- `targetUser.exp + amount` — если amount строка "100", будет конкатенация "0100".
- Math.max(0, "0100") → "0100" (строка), Prisma упадёт на Int-поле.
- Нет проверки Number.isInteger.

БАГ #3: Race condition в /api/panel/users/exp.
- findUnique → update без increment. Между ними другой запрос может изменить exp.

БАГ #4: /api/top-exp не исключает админов.
- where: { role: { not: 'banned' } } — админы попадают в рейтинг, хотя могут накручивать себе EXP.

БАГ #5: /api/top-exp возвращает только 5 записей.
- take: 5, хотя вкладка называется "Топ" и top10 возвращает 10. Непоследовательно.

БАГ #6: В админке после handleExpChange не сбрасывается форма.
- expUserId, expAmount, expUserSearch остаются. Пользователь должен стирать вручную.

БАГ #7: В админке кнопка "Применить" даёт общую "Ошибку" при amount=0.
- parseInt('0') || 0 = 0, API вернёт 400 "Укажите userId и amount", но toast покажет data.error только если res.ok===false, иначе catch→'Ошибка'. На самом деле res.ok будет false, так что покажется data.error. OK, но всё равно сбивает с толку.

БАГ #8: /api/panel/exp-rules POST принимает дробные threshold/expReward.
- Prisma Int поле упадёт. Нет Number.isInteger проверки.

БАГ #9: При повторном одобрении той же заявки (approved → revision → approved) EXP мог бы начисляться повторно.
- Без защиты через ExpGrant — будет двойное начисление.

БАГ #10: /api/panel/users/exp не проверяет, что юзер не забанен.
- Можно начислить EXP забаненному.

БАГ #11: ProfileView грузит EXP один раз при монтировании, не обновляется после действий.
- Если юзер получил EXP — не увидит без перезагрузки.

БАГ #12: SearchLog.create в /api/search — fire-and-forget, нет ID для EXP tracking.
- Нужно переделать на .then() для получения id.

Work Log:
- (в процессе)

Stage Summary:
- (в процессе)
