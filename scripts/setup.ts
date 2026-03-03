#!/usr/bin/env bun
import fs from 'fs-extra';
import path from 'node:path';

// 使用当前工作目录（bun create 时为项目根目录）
const rootDir = process.cwd();

/**
 * 生成 UUID（不带连字符）
 */
function generateUuid(): string {
	return crypto.randomUUID().replaceAll('-', '');
}

/**
 * 获取项目名称（从目录名）
 */
function getProjectName(): string {
	// bun create 会将目录名作为项目名
	return path.basename(process.cwd());
}

/**
 * 主函数
 */
async function main() {
	const projectName = getProjectName();
	const newUuid = generateUuid();

	console.log(`\n🚀 正在配置项目: ${projectName}\n`);

	// 1. 更新 package.json
	const pkgPath = path.join(rootDir, 'package.json');
	if (await fs.pathExists(pkgPath)) {
		const pkg = await fs.readJson(pkgPath);
		pkg.name = projectName;
		// 移除 bun-create 配置（bun create 会自动移除，但保险起见）
		delete pkg['bun-create'];
		await fs.writeJson(pkgPath, pkg, { spaces: '\t', EOL: '\n' });
		console.log('  ✓ 更新 package.json');
	}

	// 2. 更新 extension.json
	const extPath = path.join(rootDir, 'extension.json');
	if (await fs.pathExists(extPath)) {
		const ext = await fs.readJson(extPath);
		ext.name = projectName;
		ext.uuid = newUuid;
		// @ts-expect-error - 可能存在 default 属性
		delete ext.default;
		await fs.writeJson(extPath, ext, { spaces: '\t', EOL: '\n' });
		console.log('  ✓ 更新 extension.json');
	}

	// 3. 更新 README.md 中的项目名占位符
	const readmePath = path.join(rootDir, 'README.md');
	if (await fs.pathExists(readmePath)) {
		let content = await fs.readFile(readmePath, 'utf-8');
		// 替换常见的项目名占位符
		content = content.replace(/pro-api-sdk/g, projectName);
		await fs.writeFile(readmePath, content);
		console.log('  ✓ 更新 README.md');
	}

	console.log(`\n✅ 项目配置完成！\n`);
	console.log(`  项目名称: ${projectName}`);
	console.log(`  扩展 UUID: ${newUuid}\n`);
	console.log(`运行 'bun run build' 构建项目。\n`);
}

main().catch(console.error);
