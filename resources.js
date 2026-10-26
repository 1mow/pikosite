/* PikoSite — resources.js
   База внешних ресурсов. {d} подставляется доменом из отчёта.
   oss:1 — у проекта открытый исходный код. Записи без {d} открываются как есть. */
window.PIKO_RESOURCES = [
  /* ---- DNS и WHOIS ---- */
  { n: 'ICANN Lookup',      c: 'DNS и WHOIS', u: 'https://lookup.icann.org/en/lookup?name={d}', t: 'Официальный RDAP/WHOIS от ICANN.' },
  { n: 'ViewDNS.info',      c: 'DNS и WHOIS', u: 'https://viewdns.info/dnsrecord/?domain={d}', t: 'DNS-записи, обратный IP, история смены NS.' },
  { n: 'who.is',            c: 'DNS и WHOIS', u: 'https://who.is/whois/{d}', t: 'Быстрый WHOIS и данные регистратора.' },
  { n: 'Robtex',            c: 'DNS и WHOIS', u: 'https://www.robtex.com/dns-lookup/{d}', t: 'Граф связей DNS, IP и сетей.' },
  { n: 'DNSViz',            c: 'DNS и WHOIS', u: 'https://dnsviz.net/d/{d}/dnssec/', t: 'Визуализация цепочки DNSSEC и ошибок зоны.', oss: 1 },
  { n: 'IntoDNS',           c: 'DNS и WHOIS', u: 'https://intodns.com/{d}', t: 'Проверка корректности DNS-настроек.' },
  { n: 'MXToolbox',         c: 'DNS и WHOIS', u: 'https://mxtoolbox.com/SuperTool.aspx?action=mx%3a{d}&run=toolpage', t: 'MX, SPF, DKIM и чёрные списки.' },
  { n: 'Hurricane Electric BGP', c: 'DNS и WHOIS', u: 'https://bgp.he.net/dns/{d}', t: 'DNS и BGP-маршруты по домену.' },
  { n: 'RIPEstat',          c: 'DNS и WHOIS', u: 'https://stat.ripe.net/{d}', t: 'Данные RIPE NCC: сети, ASN, маршрутизация.' },
  { n: 'SecurityTrails',    c: 'DNS и WHOIS', u: 'https://securitytrails.com/domain/{d}/dns', t: 'История DNS и связанные домены.' },

  /* ---- Поддомены и сертификаты ---- */
  { n: 'crt.sh',            c: 'Поддомены и сертификаты', u: 'https://crt.sh/?q={d}', t: 'Поиск по логам Certificate Transparency.' },
  { n: 'Censys',            c: 'Поддомены и сертификаты', u: 'https://search.censys.io/search?resource=hosts&q={d}', t: 'Хосты, порты и сертификаты в интернете.' },
  { n: 'Shodan',            c: 'Поддомены и сертификаты', u: 'https://www.shodan.io/search?query=hostname%3A{d}', t: 'Открытые сервисы и баннеры по hostname.' },
  { n: 'DNSDumpster',       c: 'Поддомены и сертификаты', u: 'https://dnsdumpster.com/', t: 'Карта поддоменов и DNS (введите домен вручную).' },

  /* ---- Репутация и угрозы ---- */
  { n: 'VirusTotal',        c: 'Репутация и угрозы', u: 'https://www.virustotal.com/gui/domain/{d}', t: 'Анализ домена десятками антивирусных движков.' },
  { n: 'urlscan.io',        c: 'Репутация и угрозы', u: 'https://urlscan.io/search/#domain%3A{d}', t: 'Скриншоты и сканы страниц домена.' },
  { n: 'AlienVault OTX',    c: 'Репутация и угрозы', u: 'https://otx.alienvault.com/indicator/domain/{d}', t: 'Открытая база индикаторов угроз.' },
  { n: 'Cisco Talos',       c: 'Репутация и угрозы', u: 'https://talosintelligence.com/reputation_center/lookup?search={d}', t: 'Репутация домена от Talos.' },
  { n: 'Google Safe Browsing', c: 'Репутация и угрозы', u: 'https://transparencyreport.google.com/safe-browsing/search?url={d}', t: 'Статус безопасности сайта в Google.' },
  { n: 'URLhaus',           c: 'Репутация и угрозы', u: 'https://urlhaus.abuse.ch/browse.php?search={d}', t: 'Открытая база вредоносных URL (abuse.ch).' },
  { n: 'Spamhaus',          c: 'Репутация и угрозы', u: 'https://check.spamhaus.org/results?query={d}', t: 'Проверка домена в списках Spamhaus.' },
  { n: 'Sucuri SiteCheck',  c: 'Репутация и угрозы', u: 'https://sitecheck.sucuri.net/results/{d}', t: 'Сканер вредоносного кода и блэклистов.' },

  /* ---- TLS и безопасность ---- */
  { n: 'SSL Labs',          c: 'TLS и безопасность', u: 'https://www.ssllabs.com/ssltest/analyze.html?d={d}', t: 'Подробный аудит TLS-конфигурации.' },
  { n: 'Security Headers',  c: 'TLS и безопасность', u: 'https://securityheaders.com/?q={d}&followRedirects=on', t: 'Оценка HTTP-заголовков безопасности.' },
  { n: 'MDN Observatory',   c: 'TLS и безопасность', u: 'https://developer.mozilla.org/en-US/observatory/analyze?host={d}', t: 'Аудит безопасности сайта от Mozilla.' },
  { n: 'Hardenize',         c: 'TLS и безопасность', u: 'https://www.hardenize.com/report/{d}', t: 'DNS, почта, TLS и веб — в одном отчёте.' },
  { n: 'Internet.nl',       c: 'TLS и безопасность', u: 'https://internet.nl/site/{d}/', t: 'Тест современных стандартов: IPv6, DNSSEC, TLS.' },

  /* ---- Сайт, технологии, история ---- */
  { n: 'Wayback Machine',   c: 'Сайт и история', u: 'https://web.archive.org/web/*/{d}', t: 'Архив версий сайта.' },
  { n: 'archive.today',     c: 'Сайт и история', u: 'https://archive.ph/{d}', t: 'Независимые снимки страниц.' },
  { n: 'BuiltWith',         c: 'Сайт и история', u: 'https://builtwith.com/{d}', t: 'Технологический стек сайта.' },
  { n: 'Netcraft',          c: 'Сайт и история', u: 'https://sitereport.netcraft.com/?url={d}', t: 'Отчёт о хостинге и технологиях.' },
  { n: 'Web-Check',         c: 'Сайт и история', u: 'https://web-check.xyz/results/{d}', t: 'Комплексный анализ сайта: заголовки, порты, DNS.', oss: 1 },
  { n: 'SimilarWeb',        c: 'Сайт и история', u: 'https://www.similarweb.com/website/{d}/', t: 'Оценка трафика и источников.' },

  /* ---- Поиск и утечки в открытых источниках ---- */
  { n: 'Google (site:)',    c: 'Поиск в открытых источниках', u: 'https://www.google.com/search?q=site%3A{d}', t: 'Индексированные страницы домена.' },
  { n: 'Bing (site:)',      c: 'Поиск в открытых источниках', u: 'https://www.bing.com/search?q=site%3A{d}', t: 'Индекс Bing по домену.' },
  { n: 'DuckDuckGo (site:)', c: 'Поиск в открытых источниках', u: 'https://duckduckgo.com/?q=site%3A{d}', t: 'Приватный поиск по домену.' },
  { n: 'Yandex (site:)',    c: 'Поиск в открытых источниках', u: 'https://yandex.com/search/?text=site%3A{d}', t: 'Индекс Яндекса по домену.' },
  { n: 'GitHub Code Search', c: 'Поиск в открытых источниках', u: 'https://github.com/search?q=%22{d}%22&type=code', t: 'Упоминания домена в открытом коде.' },
  { n: 'Hunter.io',         c: 'Поиск в открытых источниках', u: 'https://hunter.io/try/search/{d}', t: 'Публичные корпоративные адреса почты.' },
  { n: 'Intelligence X',    c: 'Поиск в открытых источниках', u: 'https://intelx.io/?s={d}', t: 'Поисковик по утечкам и архивам.' },

  /* ---- Open-source утилиты (запускаются у вас локально) ---- */
  { n: 'theHarvester',      c: 'Open-source утилиты', u: 'https://github.com/laramies/theHarvester', t: 'Сбор почт, поддоменов и хостов из открытых источников.', oss: 1 },
  { n: 'Subfinder',         c: 'Open-source утилиты', u: 'https://github.com/projectdiscovery/subfinder', t: 'Быстрый пассивный поиск поддоменов.', oss: 1 },
  { n: 'OWASP Amass',       c: 'Open-source утилиты', u: 'https://github.com/owasp-amass/amass', t: 'Картирование поверхности атаки и поддоменов.', oss: 1 },
  { n: 'dnsx',              c: 'Open-source утилиты', u: 'https://github.com/projectdiscovery/dnsx', t: 'Массовые DNS-запросы и фильтрация.', oss: 1 },
  { n: 'httpx',             c: 'Open-source утилиты', u: 'https://github.com/projectdiscovery/httpx', t: 'Проверка живых хостов и технологий по HTTP.', oss: 1 },
  { n: 'Sublist3r',         c: 'Open-source утилиты', u: 'https://github.com/aboul3la/Sublist3r', t: 'Перебор поддоменов через поисковики.', oss: 1 },
  { n: 'dnsrecon',          c: 'Open-source утилиты', u: 'https://github.com/darkoperator/dnsrecon', t: 'Разведка DNS: зоны, брутфорс, кэш.', oss: 1 },
  { n: 'SpiderFoot',        c: 'Open-source утилиты', u: 'https://github.com/smicallef/spiderfoot', t: 'Автоматизация OSINT по сотням модулей.', oss: 1 },
  { n: 'Recon-ng',          c: 'Open-source утилиты', u: 'https://github.com/lanmaster53/recon-ng', t: 'Модульный фреймворк веб-разведки.', oss: 1 },
  { n: 'dnstwist',          c: 'Open-source утилиты', u: 'https://github.com/elceef/dnstwist', t: 'Поиск доменов-двойников и тайпсквоттинга.', oss: 1 },
  { n: 'assetfinder',       c: 'Open-source утилиты', u: 'https://github.com/tomnomnom/assetfinder', t: 'Поиск связанных доменов и поддоменов.', oss: 1 },
  { n: 'WhatWeb',           c: 'Open-source утилиты', u: 'https://github.com/urbanadventurer/WhatWeb', t: 'Определение CMS, серверов и библиотек.', oss: 1 },
  { n: 'testssl.sh',        c: 'Open-source утилиты', u: 'https://github.com/testssl/testssl.sh', t: 'Проверка TLS/SSL из командной строки.', oss: 1 },
  { n: 'gau',               c: 'Open-source утилиты', u: 'https://github.com/lc/gau', t: 'Известные URL из Wayback, Common Crawl и OTX.', oss: 1 },
  { n: 'waybackurls',       c: 'Open-source утилиты', u: 'https://github.com/tomnomnom/waybackurls', t: 'Все URL домена из Web Archive.', oss: 1 },
  { n: 'Katana',            c: 'Open-source утилиты', u: 'https://github.com/projectdiscovery/katana', t: 'Быстрый краулер сайтов.', oss: 1 },
  { n: 'Nuclei',            c: 'Open-source утилиты', u: 'https://github.com/projectdiscovery/nuclei', t: 'Сканер по шаблонам для проверки конфигураций.', oss: 1 },
  { n: 'OSINT Framework',   c: 'Open-source утилиты', u: 'https://github.com/lockfale/OSINT-Framework', t: 'Каталог OSINT-инструментов по категориям.', oss: 1 }
];
