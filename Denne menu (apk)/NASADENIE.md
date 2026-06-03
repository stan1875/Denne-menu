# Sprievodca nasadením na GitHub + Vercel

Celý proces ti zaberie cca 15 minút. Musíš to urobiť len raz.

---

## Krok 1 — Vytvor GitHub účet

1. Choď na [github.com](https://github.com)
2. Klikni **Sign up**
3. Zadaj email, heslo, používateľské meno
4. Potvrď email

---

## Krok 2 — Vytvor nový repozitár

1. Po prihlásení klikni na **+** (vpravo hore) → **New repository**
2. Názov: `denne-menu`
3. Visibility: **Public** (Vercel to potrebuje zadarmo)
4. Klikni **Create repository**

---

## Krok 3 — Nahraj súbory

Na stránke repozitára klikni **uploading an existing file** (alebo "Add file" → "Upload files").

Nahraj celý obsah priečinka `denne-menu-app` — t.j. tieto súbory a priečinky:
```
package.json
next.config.js
pages/
  index.js
  api/
    menus.js
```

> **Dôležité:** Nahraj priečinok `pages` so všetkými podpriečinkami, nie len jednotlivé súbory.

Klikni **Commit changes**.

---

## Krok 4 — Vytvor Vercel účet a nasaď

1. Choď na [vercel.com](https://vercel.com)
2. Klikni **Sign Up** → vyber **Continue with GitHub**
3. Povol Vercel prístup ku GitHubu
4. Klikni **Add New Project**
5. Nájdi repozitár `denne-menu` a klikni **Import**
6. Nechaj všetko predvolené a klikni **Deploy**

Vercel sám nainštaluje závislosti a spustí build. Trvá to 1–2 minúty.

---

## Krok 5 — Hotovo 🎉

Po nasadení dostaneš URL v tvare:
```
https://denne-menu-abc123.vercel.app
```

Túto URL môžeš:
- Otvoriť na mobile (pridaj na plochu: Safari → Zdieľať → Pridať na plochu)
- Poslať žene — ona si to tiež môže uložiť na plochu

---

## Aktualizácia v budúcnosti

Ak budeš chcieť niečo zmeniť (napr. pridať reštauráciu), stačí:
1. Upraviť súbor na GitHub (cez web, tlačidlo ceruzky)
2. Vercel sa automaticky znovu nasadí do 1 minúty

---

## Poznámky

| Reštaurácia | Stav |
|---|---|
| Phill's Corner | ✅ automatické načítanie |
| Čtyrka | ✅ automatické načítanie |
| Pod Párou | ✅ automatické načítanie |
| Twenty7 | ⚠️ dočasne zatvorená |
| Vnitroblock, Mexická, ostatné | 🔗 len odkaz (stránky vyžadujú JavaScript) |
