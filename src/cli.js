import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArguments(rawArgs){
	const args = arg(
		{
			'--git': Boolean,
			'--yes': Boolean,
			'--install': Boolean,
			'-g': '--git',
			'-y': '--yes',
			'-i': '--install'
		},
		{
			argv: rawArgs.slice(2),
		}
	);
	return {
		skipPrompts: args['--yes'] || false,
		git: args['--git'] || false,
		template: args._[0],
		runInstall: args['--install'] || false
	}
}

async function missingOpts(opts) {
	const defaultTemplate = 'New';
	if (opts.skipPrompts) {
		return {
			...opts,
			template: opts.template || defaultTemplate
		}
	}

	const questions = [];
	if (!opts.template) {
		questions.push({
			type: 'list',
			name: 'template',
			message: 'Choose the template for your project',
			choices: ['JavaScript', 'React', 'Node', 'TypeScript'],
			default: defaultTemplate
		});
	}

	if(!opts.git){
		questions.push({
			type: 'confirm',
			name: 'git',
			message: 'Do you want to initialize a git repository?',
			default: false
		})
	}

	const answers = await inquirer.prompt(questions);

	return {
		...opts,
		template: opts.template || answers.template,
		git: opts.git || answers.git
	}
}

export async function cli(args){
	let opts = parseArguments(args);
	opts = await missingOpts(opts);
	await createProject(opts);
}
