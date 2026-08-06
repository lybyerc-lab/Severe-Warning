function identityInstallStyle() {
  if (document.getElementById('presentationIdentityMooBrewStyles')) return;
  const style = document.createElement('style');
  style.id = 'presentationIdentityMooBrewStyles';
  style.textContent = `
    :root {
      --identity-safe-top: max(8px, env(safe-area-inset-top));
      --identity-safe-right: max(8px, env(safe-area-inset-right));
      --identity-safe-bottom: max(8px, env(safe-area-inset-bottom));
      --identity-safe-left: max(8px, env(safe-area-inset-left));
    }
    #resultsOverlay {
      box-sizing: border-box !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      padding: var(--identity-safe-top) var(--identity-safe-right) var(--identity-safe-bottom) var(--identity-safe-left) !important;
    }
    #resultsOverlay .results-card.identity-results-card {
      box-sizing: border-box !important;
      width: min(760px, calc(100vw - var(--identity-safe-left) - var(--identity-safe-right))) !important;
      height: auto !important;
      max-height: calc(100dvh - var(--identity-safe-top) - var(--identity-safe-bottom)) !important;
      margin: auto !important;
      display: grid !important;
      grid-template-rows: auto auto minmax(0, 1fr) auto !important;
      overflow: hidden !important;
      padding: clamp(8px, 1.4vh, 16px) clamp(10px, 1.5vw, 20px) clamp(9px, 1.5vh, 16px) !important;
    }
    #resultsOverlay .results-card.identity-results-card > h2 {
      margin: 0 !important;
      padding: 1px 0 0 !important;
      line-height: 1.02 !important;
      flex: none !important;
    }
    #resultsOverlay .results-card.identity-results-card > .grade-stamp {
      margin: 2px 0 3px !important;
      line-height: 0.94 !important;
      flex: none !important;
    }
    .identity-results-scroll {
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      scrollbar-gutter: stable;
      padding-right: 4px;
    }
    .identity-results-scroll .results-stats { margin-top: 2px !important; }
    .identity-results-scroll .bovine-report { margin-top: 6px !important; }
    #resultsOverlay .results-actions {
      flex: none !important;
      margin-top: 7px !important;
      padding-top: 1px;
      background: linear-gradient(180deg, rgba(8,15,27,0), rgba(8,15,27,0.86) 24%);
    }
    .moo-brew-score-sponsor {
      margin-top: 6px;
      padding: 6px 9px;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(251, 191, 36, 0.55);
      border-radius: 10px;
      background: linear-gradient(120deg, rgba(120,53,15,0.72), rgba(15,23,42,0.92));
      color: #fff7ed;
      font: 800 9px/1.25 Inter, sans-serif;
    }
    .moo-brew-score-cup {
      width: 28px;
      height: 32px;
      border-radius: 4px 4px 9px 9px;
      background: linear-gradient(180deg, #fbbf24 0 22%, #fff7ed 22% 100%);
      border: 2px solid #7c2d12;
      box-shadow: 0 0 14px rgba(251,191,36,0.28);
      transform: rotate(-6deg);
      position: relative;
    }
    .moo-brew-score-cup::after {
      content: 'M';
      position: absolute;
      inset: 10px 0 auto;
      color: #7c2d12;
      font: 1000 12px/1 Outfit, sans-serif;
      text-align: center;
    }
    .moo-brew-score-sponsor strong { color: #fde047; letter-spacing: 0.07em; }
    .moo-brew-score-sponsor small { display: block; margin-top: 2px; color: #fdba74; font-weight: 750; }

    #mooBrewBroadcastBug {
      position: fixed;
      right: max(12px, env(safe-area-inset-right));
      top: max(58px, calc(env(safe-area-inset-top) + 48px));
      z-index: 24;
      padding: 5px 8px 5px 28px;
      border: 1px solid rgba(251,191,36,0.5);
      border-radius: 999px;
      background: rgba(67,20,7,0.82);
      color: #fff7ed;
      font: 900 8px/1 Outfit, sans-serif;
      letter-spacing: 0.08em;
      box-shadow: 0 0 18px rgba(251,191,36,0.2);
      pointer-events: none;
    }
    #mooBrewBroadcastBug::before {
      content: 'M';
      position: absolute;
      left: 6px;
      top: 50%;
      width: 16px;
      height: 16px;
      transform: translateY(-50%) rotate(-7deg);
      display: grid;
      place-items: center;
      border-radius: 3px 3px 6px 6px;
      background: #fbbf24;
      color: #7c2d12;
      font: 1000 10px/1 Outfit, sans-serif;
    }

    #mooBrewIntro {
      position: fixed;
      inset: 0;
      z-index: 220;
      display: none;
      overflow: hidden;
      background: #07111f;
      color: #fff7ed;
      font-family: Inter, sans-serif;
      isolation: isolate;
    }
    #mooBrewIntro.active { display: block; }
    .identity-intro-sky {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 70% 16%, rgba(251,191,36,0.42), transparent 17%),
        linear-gradient(180deg, #26384d 0 44%, #c9b982 44% 100%);
      transition: filter 700ms ease, transform 1100ms ease;
    }
    .identity-intro-clouds {
      position: absolute;
      inset: -20% -10% 35%;
      background: repeating-radial-gradient(ellipse at 20% 40%, rgba(31,41,55,0.92) 0 9%, transparent 10% 20%);
      opacity: 0.74;
      transform: translateX(-5%);
      transition: transform 1700ms ease, opacity 700ms ease;
    }
    .identity-intro-ground {
      position: absolute;
      left: -5%; right: -5%; bottom: -16%; height: 58%;
      background:
        linear-gradient(100deg, transparent 0 45%, rgba(113,63,18,0.28) 46% 50%, transparent 51%),
        repeating-linear-gradient(92deg, #6b8f4e 0 5%, #7ca45b 5% 10%);
      transform: perspective(500px) rotateX(58deg);
      transform-origin: bottom;
    }
    .identity-intro-barn {
      position: absolute;
      left: 15%; bottom: 24%; width: 190px; height: 112px;
      background: #9f312f;
      border: 5px solid #5f1e1d;
      box-shadow: 16px 18px 0 rgba(15,23,42,0.18);
      transition: transform 650ms ease;
    }
    .identity-intro-barn::before {
      content: '';
      position: absolute;
      left: -17px; top: -70px;
      width: 214px; height: 82px;
      background: #6b1e1e;
      clip-path: polygon(0 100%, 18% 38%, 50% 0, 82% 38%, 100% 100%);
      transform-origin: 88% 100%;
      transition: transform 700ms cubic-bezier(.2,.8,.2,1);
    }
    .identity-intro-barn::after {
      content: 'MOO BREW FARM PARTNER';
      position: absolute;
      left: 18px; right: 18px; top: 34px;
      padding: 7px 4px;
      background: #fff7ed;
      color: #7c2d12;
      border: 3px solid #fbbf24;
      font: 1000 13px/1 Outfit, sans-serif;
      text-align: center;
      letter-spacing: 0.05em;
    }
    .identity-intro-cow {
      position: absolute;
      left: 47%; bottom: 22%; width: 160px; height: 105px;
      transform-origin: 50% 70%;
      transition: transform 450ms ease, filter 300ms ease;
    }
    .identity-intro-cow-body {
      position: absolute;
      left: 9px; top: 24px; width: 116px; height: 64px;
      border-radius: 32px 26px 24px 30px;
      background:
        radial-gradient(circle at 28% 34%, #171717 0 13%, transparent 14%),
        radial-gradient(circle at 68% 62%, #171717 0 16%, transparent 17%),
        #f8fafc;
      border: 4px solid #1c1917;
    }
    .identity-intro-cow-head {
      position: absolute;
      right: 0; top: 14px; width: 58px; height: 55px;
      border-radius: 20px 24px 18px 18px;
      background: #f8fafc;
      border: 4px solid #1c1917;
      transition: transform²È="24ÀÕ•´ì(€€€€€èµ¥¹‘•àè€ÄÈì(€€€ô(€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ‰É…¹ì(€€€€€Á½Í¥Ñ¥½¸è…‰Í½±ÕÑ”ì(€€€€€±•™Ðèµ…à ÄÉÁà°•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ðµ±•™Ð¤¤ìÑ½Àèµ…à ÄÉÁà°•¹Ø¡Í…™”µ…É•„µ¥¹Í•ÐµÑ½À¤¤ì(€€€€€èµ¥¹‘•àè€ÄÈì(€€€€€½±½Èè€™‘”ÀÐÜì(€€€€€™½¹Ðè€ÄÀÀÀ€ÄáÁà¼Ä=ÕÑ™¥Ð°Í…¹ÌµÍ•É¥˜ì(€€€€€±•ÑÑ•ÈµÍÁ…¥¹œè€À¸Àá•´ì(€€€€€Ñ•áÐµÍ¡…‘½Üè€À€ÍÁà€ÄÉÁàÉ‰„ À°À°À°À¸ØÔ¤ì(€€€ô(€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÍ­¥Àì(€€€€€Á½Í¥Ñ¥½¸è…‰Í½±ÕÑ”ì(€€€€€É¥¡Ðèµ…à ÄÉÁà°•¹Ø¡Í…™”µ…É•„µ¥¹Í•ÐµÉ¥¡Ð¤¤ìÑ½Àèµ…à ÄÉÁà°•¹Ø¡Í…™”µ…É•„µ¥¹Í•ÐµÑ½À¤¤ì(€€€€€èµ¥¹‘•àè€ÄÐì(€€€€€‰½É‘•Èè€ÅÁàÍ½±¥É‰„ ÈÔÔ°ÈÔÔ°ÈÔÔ°À¸Ðà¤ì(€€€€€‰½É‘•ÈµÉ…‘¥ÕÌè€ääåÁàì(€€€€€Á…‘‘¥¹œè€áÁà€ÄÍÁàì(€€€€€‰…­É½Õ¹èÉ‰„ Ü°ÄÜ°ÌÄ°À¸Ü¤ì(€€€€€½±½Èè€™™˜ì(€€€€€™½¹Ðè€àÀÀ€ÄÁÁà¼Ä%¹Ñ•È°Í…¹ÌµÍ•É¥˜ì(€€€ô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¹•ÝÍÁ…Á•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•Èì(€€€€€½Á…¥Ñäè€Äì(€€€€€ÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ´ÔÀ”°€´ÔÀ”¤É½Ñ…Ñ” ´Í‘•œ¤Í…±” Ä¤ì(€€€ô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô™…É´µÉ•Ù•…°t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•È°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôµ½¼µ‰É•ÜµÍ¥Àt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•È°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÝ•…Ñ¡•ÈµÝ…É¹¥¹œt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•È°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô½Üµ‘½Õ‰±”µÑ…­”t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•È°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•È°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•È°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¹•ÝÍÁ…Á•Èì(€€€€€½Á…¥Ñäè€Àì(€€€€€ÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ´ÔÀ”°€´ÄÐÀ”¤É½Ñ…Ñ” ÄÉ‘•œ¤Í…±” Ä¸Ä¤ì(€€€€€Á½¥¹Ñ•Èµ•Ù•¹ÑÌè¹½¹”ì(€€€ô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôµ½¼µ‰É•ÜµÍ¥Àt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÕÀìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ´ÈÁÁà°€´ÄÍÁà¤É½Ñ…Ñ” ´Èá‘•œ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÝ•…Ñ¡•ÈµÝ…É¹¥¹œt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÉ…‘¥¼°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô½Üµ‘½Õ‰±”µÑ…­”t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÉ…‘¥¼°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÉ…‘¥¼°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÉ…‘¥¼°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÉ…‘¥¼ì½Á…¥Ñäè€ÄìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ•d À¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô½Üµ‘½Õ‰±”µÑ…­”t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ½Üµ¡•…°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ½Üµ¡•…°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ½Üµ¡•…°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ½Üµ¡•…ìÑÉ…¹Í™½É´èÉ½Ñ…Ñ” ´ÌÑ‘•œ¤ÑÉ…¹Í±…Ñ” ´ÕÁà°€´ÍÁà¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô½Üµ‘½Õ‰±”µÑ…­”t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÕÀ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÕÀ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÕÀ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÕÀìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ÌáÁà°€ÜáÁà¤É½Ñ…Ñ” äÉ‘•œ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸ì½Á…¥Ñäè€Äìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÄ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÄ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÄìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ´ÄÄÁÁà°€ÈÁÁà¤É½Ñ…Ñ” ´Äá‘•œ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÈ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÈ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÈìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ´ÐÕÁà°€ÐÙÁà¤É½Ñ…Ñ” ÄÙ‘•œ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ô¡¥­•¸µÍ…ÑÑ•Èt€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÌ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÌ°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ¡¥­•¸¹ŒÌìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ÔáÁà°€ÈÉÁà¤É½Ñ…Ñ” ´ÄÉ‘•œ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÑ½É¹…‘¼°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÑ½É¹…‘¼ì½Á…¥Ñäè€ÄìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ•d À¤Í…±” Ä¤É½Ñ…Ñ” À¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ‰…É¸èé‰•™½É”°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ‰…É¸èé‰•™½É”ìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ÜÕÁà°€´ÐÕÁà¤É½Ñ…Ñ” ÈÑ‘•œ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ½É¹…‘¼µÑ½Õ¡‘½Ý¸t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ½Ü°(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ½ÜìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ” ´ÄáÁà°€´ÑÁà¤É½Ñ…Ñ” ´Õ‘•œ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÍ­äìÑÉ…¹Í™½É´èÍ…±” Ä¸ÄØ¤ÑÉ…¹Í±…Ñ•d à”¤ì™¥±Ñ•Èè½¹ÑÉ…ÍÐ Ä¸Àà¤Í…ÑÕÉ…Ñ” À¸äÈ¤‰É¥¡Ñ¹•ÍÌ À¸ÜÈ¤ìô(€€€€µ½½	É•Ý%¹ÑÉ½m‘…Ñ„µÁ¡…Í”ôÑ…Ñ¥…°µ¡…¹‘½™˜t€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ±½Õ‘ÌìÑÉ…¹Í™½É´èÑÉ…¹Í±…Ñ•` ÄÔ”¤ì½Á…¥Ñäè€À¸äÈìô((€€€µ•‘¥„€¡µ…àµÝ¥‘Ñ è€àÔÁÁà¤°€¡µ…àµ¡•¥¡Ðè€ÜÈÁÁà¤°€¡½É¥•¹Ñ…Ñ¥½¸è±…¹‘Í…Á”¤…¹€¡Á½¥¹Ñ•Èè½…ÉÍ”¤ì(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…É¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµ…ÉìÝ¥‘Ñ èµ¥¸ ØàÁÁà°…±Œ ÄÀÁÙÜ€´€ÄÉÁà¤¤€…¥µÁ½ÉÑ…¹ÐìÁ…‘‘¥¹œè€ÙÁà€åÁà€ÝÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…É¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµ…É€ø Èì™½¹ÐµÍ¥é”è€ÄÙÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…É¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµ…É€ø€¹É…‘”µÍÑ…µÀì™½¹ÐµÍ¥é”è€ÈáÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµÍÉ½±°€¹É•ÍÕ±ÑÌµÍÑ…ÑÌì™½¹ÐµÍ¥é”è€ä¸ÕÁà€…¥µÁ½ÉÑ…¹Ðì±¥¹”µ¡•¥¡Ðè€Ä¸Äà€…¥µÁ½ÉÑ…¹ÐìÁ…‘‘¥¹œè€ÕÁà€ÝÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµÍÉ½±°€¹‰½Ù¥¹”µÉ•Á½ÉÐìÁ…‘‘¥¹œè€ÑÁà€ÝÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…Ñ¥½¹Ìì…Àè€ÕÁà€…¥µÁ½ÉÑ…¹Ðìµ…É¥¸µÑ½Àè€ÑÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…Ñ¥½¹Ì€¹É•ÑÉäµ‰Ñ¸ìµ¥¸µ¡•¥¡Ðè€ÌÉÁà€…¥µÁ½ÉÑ…¹ÐìÁ…‘‘¥¹œè€ÝÁà€ÑÁà€…¥µÁ½ÉÑ…¹Ðì™½¹ÐµÍ¥é”è€ÄÁÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€¹µ½¼µ‰É•ÜµÍ½É”µÍÁ½¹Í½ÈìÁ…‘‘¥¹œè€ÑÁà€ÝÁàì™½¹ÐµÍ¥é”è€áÁàìô(€€€€€€¹µ½¼µ‰É•ÜµÍ½É”µÕÀìÝ¥‘Ñ è€ÈÍÁàì¡•¥¡Ðè€ÈÝÁàìô(€€€€€€µ½½	É•Ý	É½…‘…ÍÑ	ÕœìÑ½Àè…ÕÑ¼ì‰½ÑÑ½´èµ…à ØÉÁà°…±Œ¡•¹Ø¡Í…™”µ…É•„µ¥¹Í•Ðµ‰½ÑÑ½´¤€¬€ÔÑÁà¤¤ì™½¹ÐµÍ¥é”è€ÝÁàìô(€€€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ‰…É¸ì±•™Ðè€ÄÀ”ì‰½ÑÑ½´è€ÈÀ”ìÑÉ…¹Í™½É´èÍ…±” À¸ÜÔ¤ìÑÉ…¹Í™½É´µ½É¥¥¸è‰½ÑÑ½´±•™Ðìô(€€€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ½Üì±•™Ðè€ÐÔ”ì‰½ÑÑ½´è€Äà”ìÑÉ…¹Í™½É´èÍ…±” À¸Üà¤ìÑÉ…¹Í™½É´µ½É¥¥¸è‰½ÑÑ½´ìô(€€€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÕÀì±•™Ðè…±Œ ÐÔ”€¬€ÄÀÑÁà¤ì‰½ÑÑ½´è…±Œ Äà”€¬€ÌÙÁà¤ìÑÉ…¹Í™½É´èÍ…±” À¸à¤ìô(€€€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÉ…‘¥¼ì±•™Ðè€Èà”ì‰½ÑÑ½´è€ÄÐ”ìÑÉ…¹Í™½É´èÍ…±” À¸à¤ìô(€€€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µÑ½É¹…‘¼ìÝ¥‘Ñ è€ÄäÁÁàì¡•¥¡Ðè€ÌàÁÁàìÉ¥¡Ðè€Ô”ìô(€€€€€€¹¥‘•¹Ñ¥Ñäµ¥¹ÑÉ¼µ…ÁÑ¥½¸ìÁ…‘‘¥¹œè€ÝÁà€ÄÉÁàì™½¹ÐµÍ¥é”è€ÄÅÁàìô(€€€ô(€€€µ•‘¥„€¡µ…àµ¡•¥¡Ðè€ÐàÁÁà¤ì(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…É¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµ…Éìµ…àµ¡•¥¡Ðè…±Œ ÄÀÁ‘Ù €´€áÁà¤€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…É¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµ…É€ø Èì™½¹ÐµÍ¥é”è€ÄÑÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€É•ÍÕ±ÑÍ=Ù•É±…ä€¹É•ÍÕ±ÑÌµ…É¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµ…É€ø€¹É…‘”µÍÑ…µÀì™½¹ÐµÍ¥é”è€ÈÑÁà€…¥µÁ½ÉÑ…¹Ðìµ…É¥¸è€À€À€ÉÁà€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµÍÉ½±°€¹É•ÍÕ±ÑÌµÍÑ…ÑÌì™½¹ÐµÍ¥é”è€à¸áÁà€…¥µÁ½ÉÑ…¹Ðì±¥¹”µ¡•¥¡Ðè€Ä¸ÄÈ€…¥µÁ½ÉÑ…¹Ðìô(€€€€€€¹¥‘•¹Ñ¥ÑäµÉ•ÍÕ±ÑÌµÍÉ½±°€¹‰½Ù¥¶R×&W÷'Bƒ2²föçB×6—¦S¢—‚–×÷'FçC²Ð¢æ–FVçF—G’×&W7VÇG2×67&öÆÂæ&÷f–æR×&W÷'BÖw&–B²föçB×6—¦S¢rãg‚–×÷'FçC²Ð¢æ–FVçF—G’×&W7VÇG2×67&öÆÂæ6×–vâ×&W7VÇB²föçB×6—¦S¢‚ãg‚–×÷'FçC²FF–æs¢G‚g‚–×÷'FçC²Ð¢7&W7VÇG4÷fW&Æ’ç&W7VÇG2Ö7F–öç2ç&WG'’Ö'Fâ²Ö–âÖ†V–v‡C¢#—‚–×÷'FçC²föçB×6—¦S¢—‚–×÷'FçC²Ð¢Ð¢ÖVF–‡&VfW'2×&VGV6VBÖÖ÷F–öã¢&VGV6R’°¢6Ööô'&Wt–çG&ò¢Â6Ööô'&Wt–çG&ò££¦&Vf÷&RÂ6Ööô'&Wt–çG&ò££¦gFW"²G&ç6—F–öâÖGW&F–öã¢×2–×÷'FçC²æ–ÖF–öâÖGW&F–öã¢×2–×÷'FçC²Ð¢Ð¢°¢Fö7VÖVçBæ†VBæVæD6†–ÆB‡7G–ÆR“°§Ð  