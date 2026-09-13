/**
 * Подсказки и факты для карточек каны.
 *
 * hint  — показывается в тренировке по запросу пользователя и снижает оценку
 *         (5 → 4 в режиме ввода, 3 → 2 в режиме выбора). Должен вести к ответу.
 * facts — блок «Интересное» на карточке в справочнике. Необязателен.
 *
 * Поля char и romaji дублируют датасет и нужны только для удобства заполнения:
 * при сборке они не используются. Расхождение с датасетом ловится тестом.
 */
export const KANA_HINTS: Record<
  string,
  { char: string; romaji: string; hint: string; facts?: string[] }
> = {
  // Хирагана · Годзюон · ряд «a»
  hiragana_a: { char: 'あ', romaji: 'a', hint: 'Как А в Абрикосе'},
  hiragana_i: { char: 'い', romaji: 'i', hint: 'Как И в Ишаке'},
  hiragana_u: { char: 'う', romaji: 'u', hint: 'Как У в Уля-ля'},
  hiragana_e: { char: 'え', romaji: 'e', hint: 'Как Э в Эхо'},
  hiragana_o: { char: 'お', romaji: 'o', hint: 'Как О в Опере'},

  // Хирагана · Годзюон · ряд «k»
  hiragana_ka: { char: 'か', romaji: 'ka', hint: 'Как КА в КАрасе' },
  hiragana_ki: { char: 'き', romaji: 'ki', hint: 'Как КИ в КИрпиче' },
  hiragana_ku: { char: 'く', romaji: 'ku', hint: 'Как КУ в КУлебяке' },
  hiragana_ke: { char: 'け', romaji: 'ke', hint: 'Как КЕ в КЕмбридже' },
  hiragana_ko: { char: 'こ', romaji: 'ko', hint: 'Как КО в «КОли не было зимы»' },

  // Хирагана · Годзюон · ряд «s»
  hiragana_sa: { char: 'さ', romaji: 'sa', hint: 'Как СА в САн-франциско' },
  hiragana_shi: { char: 'し', romaji: 'shi', hint: 'Что-то между ШИ, СИ и ЩИ: «машина марки митсубиШИ»' },
  hiragana_su: { char: 'す', romaji: 'su', hint: 'Как СУ в СУшках' },
  hiragana_se: { char: 'せ', romaji: 'se', hint: 'Как СЕ на СЕвере' },
  hiragana_so: { char: 'そ', romaji: 'so', hint: 'Как СО в СОре' },

  // Хирагана · Годзюон · ряд «t»
  hiragana_ta: { char: 'た', romaji: 'ta', hint: 'Как та в ТАбаке' },
  hiragana_chi: { char: 'ち', romaji: 'chi', hint: 'Что-то между ЧИ и ТИ: «косметика ЧИфурэ»' },
  hiragana_tsu: { char: 'つ', romaji: 'tsu', hint: 'ТЦУ в ТЦУкуёми из Наруто' },
  hiragana_te: { char: 'て', romaji: 'te', hint: 'Как ТЭ в оТЭле' },
  hiragana_to: { char: 'と', romaji: 'to', hint: 'Как ТО в ТОпоре' },

  // Хирагана · Годзюон · ряд «n»
  hiragana_na: { char: 'な', romaji: 'na', hint: 'Как НА в НАсекомом' },
  hiragana_ni: { char: 'に', romaji: 'ni', hint: 'Как НИ в НИндзя' },
  hiragana_nu: { char: 'ぬ', romaji: 'nu', hint: 'Как НУ в НУ погоди' },
  hiragana_ne: { char: 'ね', romaji: 'ne', hint: 'Как НЭ в брюНЭт' },
  hiragana_no: { char: 'の', romaji: 'no', hint: 'Как НО в НОре' },

  // Хирагана · Годзюон · ряд «h»
  hiragana_ha: { char: 'は', romaji: 'ha', hint: 'Как ХА в ХАлке' },
  hiragana_hi: { char: 'ひ', romaji: 'hi', hint: 'Как ХИ в ХИмках' },
  hiragana_fu: { char: 'ふ', romaji: 'fu', hint: 'Как ФУ в рыбе ФУгу' },
  hiragana_he: { char: 'へ', romaji: 'he', hint: 'Как Хэ на ХЭллоуин' },
  hiragana_ho: { char: 'ほ', romaji: 'ho', hint: 'Как ХО в йо-ХО-ХО' },

  // Хирагана · Годзюон · ряд «m»
  hiragana_ma: { char: 'ま', romaji: 'ma', hint: 'Как МА в МАрте' },
  hiragana_mi: { char: 'み', romaji: 'mi', hint: 'Как МИ в МИре' },
  hiragana_mu: { char: 'む', romaji: 'mu', hint: 'Как МУ в МУ-МУ' },
  hiragana_me: { char: 'め', romaji: 'me', hint: 'Как МЭ в хаджиМЭ' },
  hiragana_mo: { char: 'も', romaji: 'mo', hint: 'Как МО в МОре' },

  // Хирагана · Годзюон · ряд «y»
  hiragana_ya: { char: 'や', romaji: 'ya', hint: 'Как Я в Японии' },
  hiragana_yu: { char: 'ゆ', romaji: 'yu', hint: 'Как Ю в Юности' },
  hiragana_yo: { char: 'よ', romaji: 'yo', hint: 'Как ЙО (Ё) в ЙО-хо-хо' },

  // Хирагана · Годзюон · ряд «r»
  hiragana_ra: { char: 'ら', romaji: 'ra', hint: 'Как РА в РАмене' },
  hiragana_ri: { char: 'り', romaji: 'ri', hint: 'Как РИ в РИлсах' },
  hiragana_ru: { char: 'る', romaji: 'ru', hint: 'Как РУ на РУси' },
  hiragana_re: { char: 'れ', romaji: 're', hint: 'Как РЭ в РЭпе' },
  hiragana_ro: { char: 'ろ', romaji: 'ro', hint: 'Как РО в РОлах' },

  // Хирагана · Годзюон · ряд «w»
  hiragana_wa: { char: 'わ', romaji: 'wa', hint: 'Как ВА на сВАлке' },
  hiragana_wo: { char: 'を', romaji: 'wo', hint: 'Как ВО (УО) в «УОлтер, домой!»' },

  // Хирагана · Годзюон · ряд «nn»
  hiragana_n: { char: 'ん', romaji: 'n', hint: 'Как сонорная Н или М - соН, доМ' },

  // Хирагана · Дакутэн · ряд «g»
  hiragana_ga: { char: 'が', romaji: 'ga', hint: 'Как ГА в ГАлстуке' },
  hiragana_gi: { char: 'ぎ', romaji: 'gi', hint: 'Как ГИ в ГИпсе' },
  hiragana_gu: { char: 'ぐ', romaji: 'gu', hint: 'Как ГУ в ГУлаге' },
  hiragana_ge: { char: 'げ', romaji: 'ge', hint: 'Как ГЕ в смешном ГЭге' },
  hiragana_go: { char: 'ご', romaji: 'go', hint: 'Как ГО в ГОре' },

  // Хирагана · Дакутэн · ряд «z»
  hiragana_za: { char: 'ざ', romaji: 'za', hint: 'Как ЗА на ЗАвтрак' },
  hiragana_ji: { char: 'じ', romaji: 'ji', hint: 'Как ДЖИ в ДЖИнсах' },
  hiragana_zu: { char: 'ず', romaji: 'zu', hint: 'Как ЗУ в ЗУбе' },
  hiragana_ze: { char: 'ぜ', romaji: 'ze', hint: 'Как ЗЭ в ЗЭке' },
  hiragana_zo: { char: 'ぞ', romaji: 'zo', hint: 'Как ЗО в ЗОре' },

  // Хирагана · Дакутэн · ряд «d»
  hiragana_da: { char: 'だ', romaji: 'da', hint: 'Как ДА в ДАнии' },
  hiragana_dji: { char: 'ぢ', romaji: 'dji', hint: 'Как ДЖИ в ДЖИнсах (редко используется, чаще можно встретить じ)' },
  hiragana_dzu: { char: 'づ', romaji: 'dzu', hint: 'Когда хотели сказать ДУ но вставили З между ними «у меня в ДЗУбах что-то застряло!» (редко используется, чаще можно встретить ず)' },
  hiragana_de: { char: 'で', romaji: 'de', hint: 'Как ДЭ в ДЭке' },
  hiragana_do: { char: 'ど', romaji: 'do', hint: 'Как ДО в ДОре' },

  // Хирагана · Дакутэн · ряд «b»
  hiragana_ba: { char: 'ば', romaji: 'ba', hint: 'Как БА в БАне' },
  hiragana_bi: { char: 'び', romaji: 'bi', hint: 'Как БИ в БИле' },
  hiragana_bu: { char: 'ぶ', romaji: 'bu', hint: 'Как БУ в БУдке' },
  hiragana_be: { char: 'べ', romaji: 'be', hint: 'Как БЭ в биг-БЭне' },
  hiragana_bo: { char: 'ぼ', romaji: 'bo', hint: 'Как БО в БОру' },

  // Хирагана · Хандакутэн · ряд «p»
  hiragana_pa: { char: 'ぱ', romaji: 'pa', hint: 'Как ПА в ПАнаме' },
  hiragana_pi: { char: 'ぴ', romaji: 'pi', hint: 'Как ПИ в ПИле' },
  hiragana_pu: { char: 'ぷ', romaji: 'pu', hint: 'Как ПУ в ПУме' },
  hiragana_pe: { char: 'ぺ', romaji: 'pe', hint: 'Как ПЭ в ПЭпашнэли ватафа' },
  hiragana_po: { char: 'ぽ', romaji: 'po', hint: 'Как ПО в ПОру' },

  // Хирагана · Ёон · ряд «k»
  hiragana_kya: { char: 'きゃ', romaji: 'kya', hint: 'Как КЯ в КЯне' },
  hiragana_kyu: { char: 'きゅ', romaji: 'kyu', hint: 'Как КЮ в КЮне' },
  hiragana_kyo: { char: 'きょ', romaji: 'kyo', hint: 'Как КЁ в КЁне' },

  // Хирагана · Ёон · ряд «s»
  hiragana_sha: { char: 'しゃ', romaji: 'sha', hint: 'Как ША в ШАнсоне' },
  hiragana_shu: { char: 'しゅ', romaji: 'shu', hint: 'Меджу ШЮ и СЮ в СЮ/ШЮрикене' },
  hiragana_sho: { char: 'しょ', romaji: 'sho', hint: 'Как ШО в ШОссе' },

  // Хирагана · Ёон · ряд «t»
  hiragana_cha: { char: 'ちゃ', romaji: 'cha', hint: 'Как ЧА в ЧАне' },
  hiragana_chu: { char: 'ちゅ', romaji: 'chu', hint: 'Как ЧЮ в ЧЮнях' },
  hiragana_cho: { char: 'ちょ', romaji: 'cho', hint: 'Как ЧО на ЧОрном море' },

  // Хирагана · Ёон · ряд «n»
  hiragana_nya: { char: 'にゃ', romaji: 'nya', hint: 'Как НЯ в НЯне' },
  hiragana_nyu: { char: 'にゅ', romaji: 'nyu', hint: 'Как НЮ в НЮнях' },
  hiragana_nyo: { char: 'にょ', romaji: 'nyo', hint: 'Как НЁ когда что-то приНЁс' },

  // Хирагана · Ёон · ряд «h»
  hiragana_hya: { char: 'ひゃ', romaji: 'hya', hint: 'Как ХЯ в ХЯне' },
  hiragana_hyu: { char: 'ひゅ', romaji: 'hyu', hint: 'Как ХЮ в ХЮне' },
  hiragana_hyo: { char: 'ひょ', romaji: 'hyo', hint: 'Как ХЁ в ХЁне' },

  // Хирагана · Ёон · ряд «m»
  hiragana_mya: { char: 'みゃ', romaji: 'mya', hint: 'Как МЯ в МЯте' },
  hiragana_myu: { char: 'みゅ', romaji: 'myu', hint: 'Как МЮ в МЮнхене' },
  hiragana_myo: { char: 'みょ', romaji: 'myo', hint: 'Как МЁ когда заМЁрз' },

  // Хирагана · Ёон · ряд «r»
  hiragana_rya: { char: 'りゃ', romaji: 'rya', hint: 'Как РЯ в РЯсе' },
  hiragana_ryu: { char: 'りゅ', romaji: 'ryu', hint: 'Как РЮ в РЮмке' },
  hiragana_ryo: { char: 'りょ', romaji: 'ryo', hint: 'Как РЁ в РЁбрах' },

  // Хирагана · Ёон · ряд «g»
  hiragana_gya: { char: 'ぎゃ', romaji: 'gya', hint: 'Как ГЯ в ГЯне' },
  hiragana_gyu: { char: 'ぎゅ', romaji: 'gyu', hint: 'Как ГЮ в ГЮнтере' },
  hiragana_gyo: { char: 'ぎょ', romaji: 'gyo', hint: 'Как ГЁ в ГЁне' },

  // Хирагана · Ёон · ряд «j»
  hiragana_ja: { char: 'じゃ', romaji: 'ja', hint: 'Как ДЖА в ДЖАзе' },
  hiragana_ju: { char: 'じゅ', romaji: 'ju', hint: 'Как ДЖЮ в ДЖУсе' },
  hiragana_jo: { char: 'じょ', romaji: 'jo', hint: 'Как ДЖЁ в ДЖЁ-ДЖЁ армани' },

  // Хирагана · Ёон · ряд «b»
  hiragana_bya: { char: 'びゃ', romaji: 'bya', hint: 'Как БЯ в БЯке' },
  hiragana_byu: { char: 'びゅ', romaji: 'byu', hint: 'Как БЮ в БЮлетени' },
  hiragana_byo: { char: 'びょ', romaji: 'byo', hint: 'Как БЁ в йоханес БЁ' },

  // Хирагана · Ёон · ряд «p»
  hiragana_pya: { char: 'ぴゃ', romaji: 'pya', hint: 'Как ПЯ в ПЯтке' },
  hiragana_pyu: { char: 'ぴゅ', romaji: 'pyu', hint: 'Как ПЮ в ПЮре' },
  hiragana_pyo: { char: 'ぴょ', romaji: 'pyo', hint: 'Как ПЁ в ПЁне' },

  // Катакана · Годзюон · ряд «a»
  katakana_a: { char: 'ア', romaji: 'a', hint: 'Как А в Абрикосе' },
  katakana_i: { char: 'イ', romaji: 'i', hint: 'Как И в Ишаке' },
  katakana_u: { char: 'ウ', romaji: 'u', hint: 'Как У в Уля-ля' },
  katakana_e: { char: 'エ', romaji: 'e', hint: 'Как Э в Эхо' },
  katakana_o: { char: 'オ', romaji: 'o', hint: 'Как О в Опере' },

  // Катакана · Годзюон · ряд «k»
  katakana_ka: { char: 'カ', romaji: 'ka', hint: 'Как КА в КАрасе' },
  katakana_ki: { char: 'キ', romaji: 'ki', hint: 'Как КИ в КИрпиче' },
  katakana_ku: { char: 'ク', romaji: 'ku', hint: 'Как КУ в КУлебяке' },
  katakana_ke: { char: 'ケ', romaji: 'ke', hint: 'Как КЕ в КЕмбридже' },
  katakana_ko: { char: 'コ', romaji: 'ko', hint: 'Как КО в «КОли не было зимы»' },

  // Катакана · Годзюон · ряд «s»
  katakana_sa: { char: 'サ', romaji: 'sa', hint: 'Как СА в САн-франциско' },
  katakana_shi: { char: 'シ', romaji: 'shi', hint: 'Что-то между ШИ, СИ и ЩИ: «машина марки митсубиШИ»' },
  katakana_su: { char: 'ス', romaji: 'su', hint: 'Как СУ в СУшках' },
  katakana_se: { char: 'セ', romaji: 'se', hint: 'Как СЕ на СЕвере' },
  katakana_so: { char: 'ソ', romaji: 'so', hint: 'Как СО в СОре' },

  // Катакана · Годзюон · ряд «t»
  katakana_ta: { char: 'タ', romaji: 'ta', hint: 'Как та в ТАбаке' },
  katakana_chi: { char: 'チ', romaji: 'chi', hint: 'Что-то между ЧИ и ТИ: «косметика ЧИфурэ»' },
  katakana_tsu: { char: 'ツ', romaji: 'tsu', hint: 'ТЦУ в ТЦУкуёми из Наруто' },
  katakana_te: { char: 'テ', romaji: 'te', hint: 'Как ТЭ в оТЭле' },
  katakana_to: { char: 'ト', romaji: 'to', hint: 'Как ТО в ТОпоре' },

  // Катакана · Годзюон · ряд «n»
  katakana_na: { char: 'ナ', romaji: 'na', hint: 'Как НА в НАсекомом' },
  katakana_ni: { char: 'ニ', romaji: 'ni', hint: 'Как НИ в НИндзя' },
  katakana_nu: { char: 'ヌ', romaji: 'nu', hint: 'Как НУ в НУ погоди' },
  katakana_ne: { char: 'ネ', romaji: 'ne', hint: 'Как НЭ в брюНЭт' },
  katakana_no: { char: 'ノ', romaji: 'no', hint: 'Как НО в НОре' },

  // Катакана · Годзюон · ряд «h»
  katakana_ha: { char: 'ハ', romaji: 'ha', hint: 'Как ХА в ХАлке' },
  katakana_hi: { char: 'ヒ', romaji: 'hi', hint: 'Как ХИ в ХИмках' },
  katakana_fu: { char: 'フ', romaji: 'fu', hint: 'Как ФУ в рыбе ФУгу' },
  katakana_he: { char: 'ヘ', romaji: 'he', hint: 'Как Хэ на ХЭллоуин' },
  katakana_ho: { char: 'ホ', romaji: 'ho', hint: 'Как ХО в йо-ХО-ХО' },

  // Катакана · Годзюон · ряд «m»
  katakana_ma: { char: 'マ', romaji: 'ma', hint: 'Как МА в МАрте' },
  katakana_mi: { char: 'ミ', romaji: 'mi', hint: 'Как МИ в МИре' },
  katakana_mu: { char: 'ム', romaji: 'mu', hint: 'Как МУ в МУ-МУ' },
  katakana_me: { char: 'メ', romaji: 'me', hint: 'Как МЭ в хаджиМЭ' },
  katakana_mo: { char: 'モ', romaji: 'mo', hint: 'Как МО в МОре' },

  // Катакана · Годзюон · ряд «y»
  katakana_ya: { char: 'ヤ', romaji: 'ya', hint: 'Как Я в Японии' },
  katakana_yu: { char: 'ユ', romaji: 'yu', hint: 'Как Ю в Юности' },
  katakana_yo: { char: 'ヨ', romaji: 'yo', hint: 'Как ЙО (Ё) в ЙО-хо-хо' },

  // Катакана · Годзюон · ряд «r»
  katakana_ra: { char: 'ラ', romaji: 'ra', hint: 'Как РА в РАмене' },
  katakana_ri: { char: 'リ', romaji: 'ri', hint: 'Как РИ в РИлсах' },
  katakana_ru: { char: 'ル', romaji: 'ru', hint: 'Как РУ на РУси' },
  katakana_re: { char: 'レ', romaji: 're', hint: 'Как РЭ в РЭпе' },
  katakana_ro: { char: 'ロ', romaji: 'ro', hint: 'Как РО в РОлах' },

  // Катакана · Годзюон · ряд «w»
  katakana_wa: { char: 'ワ', romaji: 'wa', hint: 'Как ВА на сВАлке' },
  katakana_wo: { char: 'ヲ', romaji: 'wo', hint: 'Как ВО (УО) в «УОлтер, домой!»' },

  // Катакана · Годзюон · ряд «nn»
  katakana_n: { char: 'ン', romaji: 'n', hint: 'Как сонорная Н или М - соН, доМ' },

  // Катакана · Дакутэн · ряд «g»
  katakana_ga: { char: 'ガ', romaji: 'ga', hint: 'Как ГА в ГАлстуке' },
  katakana_gi: { char: 'ギ', romaji: 'gi', hint: 'Как ГИ в ГИпсе' },
  katakana_gu: { char: 'グ', romaji: 'gu', hint: 'Как ГУ в ГУлаге' },
  katakana_ge: { char: 'ゲ', romaji: 'ge', hint: 'Как ГЕ в смешном ГЭге' },
  katakana_go: { char: 'ゴ', romaji: 'go', hint: 'Как ГО в ГОре' },

  // Катакана · Дакутэн · ряд «z»
  katakana_za: { char: 'ザ', romaji: 'za', hint: 'Как ЗА на ЗАвтрак' },
  katakana_ji: { char: 'ジ', romaji: 'ji', hint: 'Как ДЖИ в ДЖИнсах' },
  katakana_zu: { char: 'ズ', romaji: 'zu', hint: 'Как ЗУ в ЗУбе' },
  katakana_ze: { char: 'ゼ', romaji: 'ze', hint: 'Как ЗЭ в ЗЭке' },
  katakana_zo: { char: 'ゾ', romaji: 'zo', hint: 'Как ЗО в ЗОре' },

  // Катакана · Дакутэн · ряд «d»
  katakana_da: { char: 'ダ', romaji: 'da', hint: 'Как ДА в ДАнии' },
  katakana_dji: { char: 'ヂ', romaji: 'dji', hint: 'Как ДЖИ в ДЖИнсах (редко используется, чаще можно встретить じ)' },
  katakana_dzu: { char: 'ヅ', romaji: 'dzu', hint: 'Когда хотели сказать ДУ но вставили З между ними «у меня в ДЗУбах что-то застряло!» (редко используется, чаще можно встретить ず)' },
  katakana_de: { char: 'デ', romaji: 'de', hint: 'Как ДЭ в ДЭке' },
  katakana_do: { char: 'ド', romaji: 'do', hint: 'Как ДО в ДОре' },

  // Катакана · Дакутэн · ряд «b»
  katakana_ba: { char: 'バ', romaji: 'ba', hint: 'Как БА в БАне' },
  katakana_bi: { char: 'ビ', romaji: 'bi', hint: 'Как БИ в БИле' },
  katakana_bu: { char: 'ブ', romaji: 'bu', hint: 'Как БУ в БУдке' },
  katakana_be: { char: 'ベ', romaji: 'be', hint: 'Как БЭ в биг-БЭне' },
  katakana_bo: { char: 'ボ', romaji: 'bo', hint: 'Как БО в БОру' },

  // Катакана · Хандакутэн · ряд «p»
  katakana_pa: { char: 'パ', romaji: 'pa', hint: 'Как ПА в ПАнаме' },
  katakana_pi: { char: 'ピ', romaji: 'pi', hint: 'Как ПИ в ПИле' },
  katakana_pu: { char: 'プ', romaji: 'pu', hint: 'Как ПУ в ПУме' },
  katakana_pe: { char: 'ペ', romaji: 'pe', hint: 'Как ПЭ в ПЭпашнэли ватафа' },
  katakana_po: { char: 'ポ', romaji: 'po', hint: 'Как ПО в ПОру' },

  // Катакана · Ёон · ряд «k»
  katakana_kya: { char: 'キャ', romaji: 'kya', hint: 'Как КЯ в КЯне' },
  katakana_kyu: { char: 'キュ', romaji: 'kyu', hint: 'Как КЮ в КЮне' },
  katakana_kyo: { char: 'キョ', romaji: 'kyo', hint: 'Как КЁ в КЁне' },

  // Катакана · Ёон · ряд «s»
  katakana_sha: { char: 'シャ', romaji: 'sha', hint: 'Как ША в ШАнсоне' },
  katakana_shu: { char: 'シュ', romaji: 'shu', hint: 'Меджу ШЮ и СЮ в СЮ/ШЮрикене' },
  katakana_sho: { char: 'ショ', romaji: 'sho', hint: 'Как ШО в ШОссе' },

  // Катакана · Ёон · ряд «t»
  katakana_cha: { char: 'チャ', romaji: 'cha', hint: 'Как ЧА в ЧАне' },
  katakana_chu: { char: 'チュ', romaji: 'chu', hint: 'Как ЧЮ в ЧЮнях' },
  katakana_cho: { char: 'チョ', romaji: 'cho', hint: 'Как ЧО на ЧОрном море' },

  // Катакана · Ёон · ряд «n»
  katakana_nya: { char: 'ニャ', romaji: 'nya', hint: 'Как НЯ в НЯне' },
  katakana_nyu: { char: 'ニュ', romaji: 'nyu', hint: 'Как НЮ в НЮнях' },
  katakana_nyo: { char: 'ニョ', romaji: 'nyo', hint: 'Как НЁ когда что-то приНЁс' },

  // Катакана · Ёон · ряд «h»
  katakana_hya: { char: 'ヒャ', romaji: 'hya', hint: 'Как ХЯ в ХЯне' },
  katakana_hyu: { char: 'ヒュ', romaji: 'hyu', hint: 'Как ХЮ в ХЮне' },
  katakana_hyo: { char: 'ヒョ', romaji: 'hyo', hint: 'Как ХЁ в ХЁне' },

  // Катакана · Ёон · ряд «m»
  katakana_mya: { char: 'ミャ', romaji: 'mya', hint: 'Как МЯ в МЯте' },
  katakana_myu: { char: 'ミュ', romaji: 'myu', hint: 'Как МЮ в МЮнхене' },
  katakana_myo: { char: 'ミョ', romaji: 'myo', hint: 'Как МЁ когда заМЁрз' },

  // Катакана · Ёон · ряд «r»
  katakana_rya: { char: 'リャ', romaji: 'rya', hint: 'Как РЯ в РЯсе' },
  katakana_ryu: { char: 'リュ', romaji: 'ryu', hint: 'Как РЮ в РЮмке' },
  katakana_ryo: { char: 'リョ', romaji: 'ryo', hint: 'Как РЁ в РЁбрах' },

  // Катакана · Ёон · ряд «g»
  katakana_gya: { char: 'ギャ', romaji: 'gya', hint: 'Как ГЯ в ГЯне' },
  katakana_gyu: { char: 'ギュ', romaji: 'gyu', hint: 'Как ГЮ в ГЮнтере' },
  katakana_gyo: { char: 'ギョ', romaji: 'gyo', hint: 'Как ГЁ в ГЁне' },

  // Катакана · Ёон · ряд «j»
  katakana_ja: { char: 'ジャ', romaji: 'ja', hint: 'Как ДЖА в ДЖАзе' },
  katakana_ju: { char: 'ジュ', romaji: 'ju', hint: 'Как ДЖЮ в ДЖУсе' },
  katakana_jo: { char: 'ジョ', romaji: 'jo', hint: 'Как ДЖЁ в ДЖЁ-ДЖЁ армани' },

  // Катакана · Ёон · ряд «b»
  katakana_bya: { char: 'ビャ', romaji: 'bya', hint: 'Как БЯ в БЯке' },
  katakana_byu: { char: 'ビュ', romaji: 'byu', hint: 'Как БЮ в БЮлетени' },
  katakana_byo: { char: 'ビョ', romaji: 'byo', hint: 'Как БЁ в йоханес БЁ' },

  // Катакана · Ёон · ряд «p»
  katakana_pya: { char: 'ピャ', romaji: 'pya', hint: 'Как ПЯ в ПЯтке' },
  katakana_pyu: { char: 'ピュ', romaji: 'pyu', hint: 'Как ПЮ в ПЮре' },
  katakana_pyo: { char: 'ピョ', romaji: 'pyo', hint: 'Как ПЁ в ПЁне' },
}
