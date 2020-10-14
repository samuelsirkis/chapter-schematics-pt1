import {
  chain,
  mergeWith,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  url,
} from "@angular-devkit/schematics";

import {
  addPackageJsonDependency,
  NodeDependencyType,
} from "@schematics/angular/utility/dependencies";

import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";

// You don't have to export the function as default. You can also have more than one rule factory
// per file.

export function main(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([hello(), addTestCoverageScript(), installPackages()])(
      tree,
      _context
    );
  };
}

export function hello(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const templates = url("./files");

    return mergeWith(templates)(tree, _context);
  };
}

export function addTestCoverageScript(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const packageJsonFileBuffer = tree.read("package.json");

    if (!packageJsonFileBuffer) {
      throw new SchematicsException("No package.json file found");
    }

    const packageJsonString: string = packageJsonFileBuffer.toString();

    const packageJsonObject = JSON.parse(packageJsonString);

    const scripts = packageJsonObject.scripts;

    scripts["test:coverage"] = "ng test --code-coverage";

    const newPackageJsonString =
      JSON.stringify(packageJsonObject, null, 2) + "\n";

    tree.overwrite("package.json", newPackageJsonString);

    return tree;
  };
}

export function installPackages(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: "@wizsolucoes/wiz-alerts",
      version: "^2.1.0",
    });

    _context.addTask(new NodePackageInstallTask());

    return tree;
  };
}
