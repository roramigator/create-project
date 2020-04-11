import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import {projectInstall} from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplate(opts){
  return copy(opts.templateDir, opts.targetDir, {
    clobber: false
  });
}

async function initGit(opts){
  const result = await execa('git', ['init'], {
    cwd: opts.targetDir
  });
  if(result.failed){
    return Promise.reject(new Error('Failed to initialize git'));
  }
  return;
}

export async function createProject(opts){
  opts = {
    ...opts,
    targetDir: opts.targetDir || process.cwd()
  };

  const currentUrl = import.meta.url;

  const templateUrl = path.resolve(
    new URL(currentUrl).pathname,
    '../../templates',
    opts.template.toLowerCase()
  );

  opts.templateDir = templateUrl;

  try {
    await access(templateUrl, fs.constants.R_OK);
  } catch(err){
    console.error('%s Invalid template name', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Copying files',
      task: () => copyTemplate(opts)
    },
    {
      title: 'Inizializing git',
      task: () => initGit(opts),
      enabled: () => opts.git
    },
    {
      title: 'Installing dependencies',
      task: () => projectInstall({
        cwd: opts.targetDir
      }),
      skip: () =>  !opts.runInstall ? 'Use --install to automatically install dependencies' : undefined
    }
  ]);

  await tasks.run();

  console.log('%s Project ready', chalk.green.bold('DONE'));
  return true;
}
