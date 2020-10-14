import { SchematicsException } from "@angular-devkit/schematics";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import * as path from "path";

const collectionPath = path.join(__dirname, "../collection.json");

describe("main", () => {
  let appTree: UnitTestTree;

  beforeEach(async () => {
    // Run ng generate workspace
    appTree = await runner
      .runExternalSchematicAsync("@schematics/angular", "workspace", {
        name: "test",
        version: "10.0.5",
      })
      .toPromise();

    // Run ng generate application
    appTree = await runner
      .runExternalSchematicAsync(
        "@schematics/angular",
        "application",
        {
          name: "my-app",
        },
        appTree
      )
      .toPromise();

    // Run our schematic
    appTree = await runner.runSchematicAsync("hello", {}, appTree).toPromise();
  });

  const runner = new SchematicTestRunner("schematics", collectionPath);
  describe("hello", () => {
    it("adds files", async () => {
      expect(appTree.files).toEqual(
        jasmine.arrayContaining<string>(["/src/hello.js"])
      );
    });
  });

  describe("addTestCoverageScript", () => {
    it("adds test coverage script", async () => {
      const packageJsonFileBuffer = appTree.read("package.json");

      if (!packageJsonFileBuffer) {
        throw new SchematicsException("No package.json file found");
      }

      const packageJsonString: string = packageJsonFileBuffer.toString();
      const packageJsonObject = JSON.parse(packageJsonString);
      const scripts = packageJsonObject.scripts;

      expect(scripts).toEqual(
        jasmine.objectContaining({
          "test:coverage": "ng test --code-coverage",
        })
      );
    });
  });
});
