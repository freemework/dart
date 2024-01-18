import { FExecutionContext } from "@freemework/common";

import Mustache from "mustache";
import { dirname } from 'path';
import { assert } from "chai";
import path from "path";
import { fileURLToPath, pathToFileURL } from 'url';

import { FSqlMigrationSources } from "../src/index.js";


const __dirname = dirname(fileURLToPath(import.meta.url));

describe("f_sql_migration_sources tests", function () {

	it("load() from disk", async function () {
		const resourcesDir: string = path.join(__dirname, "../test.files/f_sql_migration_sources");

		const migrationSources: FSqlMigrationSources = await FSqlMigrationSources
			.load(
				FExecutionContext.Default,
				pathToFileURL(resourcesDir)
			);

		assert.equal(migrationSources.versionNames.length, 3);
		assert.equal(migrationSources.versionNames[0], "v0001");
		assert.equal(migrationSources.versionNames[1], "v0002");
		assert.equal(migrationSources.versionNames[2], "vXXXX");

		const transformedSources = migrationSources.map(
			(content, opts) => {
				return Mustache.render(content, {
					...opts,
					name: opts.itemName,
					musketeers: ["Athos", "Aramis", "Porthos", "D'Artagnan"]
				});
			}
		);

		assert.equal(transformedSources.versionNames.length, 3);
		assert.equal(transformedSources.versionNames[0], "v0001");
		assert.equal(transformedSources.versionNames[1], "v0002");
		assert.equal(transformedSources.versionNames[2], "vXXXX");

		assert.equal(
			transformedSources.getVersionBundle("vXXXX").getRollbackScript("2-drop-something.js").content,
			"// 2-drop-something.js rollback \n"
		);

		//const destDir = resourcesDir + "." + Date.now();
		//fs.mkdirSync(destDir);
		//await transformedSources.saveToFilesystem(DUMMY_CANCELLATION_TOKEN, destDir);
	});

});
