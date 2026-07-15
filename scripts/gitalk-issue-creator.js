/**
 * Hexo Gitalk Issue Auto-Creator
 * 在 hexo generate 结束后自动为新文章创建 GitHub Issue
 * 所有配置从 _config.BlueLake.yml 读取
 * Issue 标题使用 MD5(path) 以避免中文路径超长问题
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const yaml = require('js-yaml');

let HttpsProxyAgent;
try { HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent; } catch (e) {}

function md5(str) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

function githubRequest(method, apiPath, data, token, proxyUrl) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method,
      headers: {
        'User-Agent': 'hexo-gitalk-bot',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (proxyUrl && HttpsProxyAgent) {
      options.agent = new HttpsProxyAgent(proxyUrl);
    }
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadGitalkConfig(baseDir) {
  const configPath = path.join(baseDir, '_config.BlueLake.yml');
  if (!fs.existsSync(configPath)) return null;
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(content);
    return config && config.gitalk ? config.gitalk : null;
  } catch (e) {
    return null;
  }
}

function getAllPostPaths(dir, basePath = '') {
  const paths = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        if (['page', 'img', 'css', 'js', 'fonts', 'archives', 'tags', 'categories'].includes(entry.name)) continue;
        paths.push(...getAllPostPaths(fullPath, relativePath));
      } else if (entry.name === 'index.html') {
        const articlePath = '/' + basePath;
        if (articlePath !== '/' && !articlePath.match(/^\/(page|archives|tags|categories|tools)\//)) {
          paths.push(articlePath);
        }
      }
    }
  } catch (e) {}
  return paths;
}

hexo.extend.filter.register('after_generate', async function () {
  const baseDir = hexo.base_dir;
  const gitalkConfig = loadGitalkConfig(baseDir);

  if (!gitalkConfig || !gitalkConfig.enable) return;

  const token = gitalkConfig.github_token;
  if (!token) {
    console.log('[Gitalk] 未配置 github_token，跳过自动创建 Issue');
    return;
  }

  const owner = gitalkConfig.owner;
  const repo = gitalkConfig.repo;
  const siteUrl = gitalkConfig.site_url || '';
  const proxy = gitalkConfig.proxy || '';
  const publicDir = path.join(baseDir, 'public');

  if (!fs.existsSync(publicDir)) return;

  const postPaths = getAllPostPaths(publicDir);
  if (postPaths.length === 0) return;

  let page = 1;
  const existingIssues = [];
  while (true) {
    const res = await githubRequest('GET', `/repos/${owner}/${repo}/issues?state=open&per_page=100&page=${page}`, null, token, proxy);
    if (res.status === 401) {
      console.error('[Gitalk] Token 已失效，请更新 _config.BlueLake.yml 中的 github_token');
      return;
    }
    if (res.status !== 200 || !res.data.length) break;
    existingIssues.push(...res.data);
    page++;
  }
  const existingTitles = new Set(existingIssues.map(i => i.title));
  console.log(`[Gitalk] 已有 ${existingIssues.length} 个 Issue，${postPaths.length} 篇文章`);

  const toCreate = postPaths.filter(p => !existingTitles.has(md5(p)));
  if (toCreate.length === 0) return;

  console.log(`[Gitalk] 发现 ${toCreate.length} 篇新文章，正在创建 Issue...`);
  let created = 0;
  for (const p of toCreate) {
    const title = md5(p);
    const res = await githubRequest('POST', `/repos/${owner}/${repo}/issues`, {
      title,
      body: `本文评论区 - ${siteUrl}${p}`,
      labels: ['Gitalk'],
    }, token, proxy);
    if (res.status === 201) {
      created++;
    } else if (res.status === 401) {
      console.error('[Gitalk] Token 已失效，请更新 _config.BlueLake.yml 中的 github_token');
      return;
    } else if (res.status === 403 || (res.data && res.data.message && res.data.message.includes('rate limit'))) {
      console.error(`[Gitalk] GitHub API 速率限制，已创建 ${created} 个，剩余 ${toCreate.length - created} 个将在下次 hexo generate 时创建`);
      return;
    } else {
      console.error(`[Gitalk] 创建失败: ${p}`, res.data.message || res.data);
    }
    await sleep(3000);
  }
  console.log(`[Gitalk] 完成！创建 ${created} 个 Issue`);
});
