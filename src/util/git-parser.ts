import { execSync } from 'child_process'
import { getLastCommit } from 'git-last-commit'
import * as chalk from 'chalk'


interface GitCommit {
  shortHash: string;
  hash: string;
  subject: string;
  sanitizedSubject: string;
  body: string;
  authoredOn: string;
  committedOn: string;
  time: string;
  author: { name: string; email: string; };
  committer: { name: string; email: string; };
  notes: string;
  branch: string;
  tags: string[];
}

export function getGitCommit(): Promise<GitCommit> {
  return new Promise((resolve, reject) => {
    getLastCommit((err: any, commit: GitCommit) => {
      if (err) { reject(err) } else {
        commit.time = execSync('git log -1 --format=%cd --date=local').toString().trim()
        resolve(commit)
      }
    })
  })
}

export async function logVersionDetails() {
  const commit = await getGitCommit()
  const commitDate = new Date(commit.time)
  console.log(`Running commit ${chalk.blueBright(commit.shortHash)} ${chalk.gray(`(${commit.subject})`)}`)
  console.log(`From ${chalk.blueBright(commitDate.toLocaleString())}`)
}
