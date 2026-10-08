function e(e){let t=e.trim(),n=t.indexOf(`
`),r=n===-1?t:t.slice(0,n),i=n===-1?``:t.slice(n+1).trim();return r.startsWith(`# `)?{title:r.slice(2).trim(),body:i}:{title:``,body:t}}export{e as t};