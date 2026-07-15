const https = require('https');
const yaml = require('js-yaml');
const fs = require('fs');
const token = yaml.load(fs.readFileSync('D:/mydoc/blog/_config.BlueLake.yml', 'utf8')).gitalk.github_token;

function fetch(urlPath) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.github.com', path: urlPath, method: 'GET',
      headers: { 'User-Agent': 'bot', 'Authorization': 'token ' + token, 'Accept': 'application/vnd.github.v3+json' },
    }, (res) => { let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(JSON.parse(b))); });
    req.end();
  });
}

(async () => {
  // Test: simulate what Gitalk does - search for issue by title
  const title = '/2019/10/14/CREO vbapi二次开发-10-外部数据';
  const q = 'repo:slacker-HD/blogtalk is:issue is:open in:title ' + title;
  const result = await fetch('/search/issues?q=' + encodeURIComponent(q));
  console.log('Search:', title);
  console.log('Total:', result.total_count);
  if (result.items && result.items.length) {
    console.log('Found:', result.items[0].title);
  } else {
    console.log('NOT FOUND');
  }

  // Also check: what does Gitalk actually search? It uses issue list, not search API
  // Gitalk v1.x uses GET /repos/{owner}/{repo}/issues with title filter
  const issues = await fetch('/repos/slacker-HD/blogtalk/issues?state=open&per_page=100&page=1');
  const found = issues.find(i => i.title === title);
  console.log('\nDirect lookup:', found ? 'FOUND' : 'NOT FOUND');
  if (found) console.log('Title:', found.title);
  
  // Check all issue titles for similar paths
  const similar = issues.filter(i => i.title.includes('vbapi') && i.title.includes('10-'));
  console.log('\nSimilar issues:');
  similar.forEach(i => console.log('  ', i.title));
})();
