import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';

function parseArguments(rawArgs){
	const args = arg(
		{
			'--git': Boolean,
			'--yes': Boolean,
			'--install': Boolean,
			'--help': Boolean,
			'-h': '--help',
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
		targetDir: args._[1],
		runInstall: args['--install'] || false,
		help: args['--help'] || false
	}
}

async function missingOpts(opts) {
	const defaultTemplate = 'Node';
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
			choices: ['JavaScript', 'React', 'Express', 'TypeScript'],
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
	if(opts.help){
		console.log('Usage: create-project TEMPLATE DIRECTORY [OPTION]...\nExample: create-project javascript -y\n\nOptions:\n-i, --install\tInstall dependencies\n-g, --git\tInitialize repository\n-y, --yes\tSet defaults');
		return;
	}
	opts = await missingOpts(opts);
	await createProject(opts);
}
